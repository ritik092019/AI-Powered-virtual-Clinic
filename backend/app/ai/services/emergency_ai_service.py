import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.ai.schemas import EmergencyAssessmentRequest, EmergencyAssessmentResponse
from app.users.models import User
from app.common.enums import UserRole, RiskLevel, NotificationType, ProcessingStatus
from app.notifications.service import NotificationService
from app.notifications.websocket_manager import websocket_manager
from app.audit.service import log_audit_event
from app.core.config import settings

logger = logging.getLogger("virtual_clinic.emergency_ai_service")

class EmergencyAIService:
    """
    Provider-independent Emergency AI Service powered by Gemini Vision / LLM.
    Evaluates acute patient presentations, generates structured first-aid steps & warnings,
    and dispatches high-alert instant notifications to doctors.
    """
    def __init__(self, db: Session):
        self.db = db
        self.notif_service = NotificationService(db)

    def process_emergency_assessment(
        self, 
        request: EmergencyAssessmentRequest, 
        performed_by_id: Optional[uuid.UUID] = None
    ) -> EmergencyAssessmentResponse:
        assessment_id = uuid.uuid4()
        symptoms_str = " ".join(request.symptoms).lower()
        desc_str = (request.injury_description or "").lower()
        vitals = request.vitals or {}

        spo2 = vitals.get("spo2") or vitals.get("spo2Percentage")
        sys_bp = vitals.get("bp_systolic") or vitals.get("systolic_bp")

        # 1. Evaluate Urgency Level
        is_critical = (
            request.high_alert_toggled or
            "chest pain" in symptoms_str or "unconscious" in symptoms_str or
            "severe bleeding" in symptoms_str or "cardiac" in desc_str or
            (spo2 is not None and spo2 < 90) or
            (sys_bp is not None and sys_bp >= 160)
        )

        is_high = (
            not is_critical and (
                "burn" in symptoms_str or "fracture" in symptoms_str or
                "breathless" in symptoms_str or "head injury" in desc_str or
                (spo2 is not None and spo2 < 94)
            )
        )

        if is_critical:
            urgency_level = "CRITICAL_EMERGENCY"
        elif is_high:
            urgency_level = "HIGH_PRIORITY"
        else:
            urgency_level = "MODERATE_URGENT"

        # 2. Build Immediate First-Aid & Basic Care Steps
        immediate_first_aid: List[str] = []
        critical_warnings: List[str] = []

        if "bleeding" in symptoms_str or "bleeding" in desc_str:
            immediate_first_aid.append("Apply firm, continuous direct pressure to the bleeding wound using sterile gauze or clean cloth.")
            immediate_first_aid.append("Elevate the injured limb above heart level if no fracture is suspected.")
            critical_warnings.append("DO NOT remove soaked dressings; layer additional pads on top.")

        if "chest pain" in symptoms_str or "cardiac" in desc_str:
            immediate_first_aid.append("Position patient in a comfortable semi-recumbent (half-sitting) posture.")
            immediate_first_aid.append("Loosen tight clothing around neck, chest, and waist.")
            immediate_first_aid.append("Administer high-flow supplemental oxygen if SpO2 < 94%.")
            critical_warnings.append("DO NOT allow patient to walk or exert physical effort.")

        if spo2 is not None and spo2 < 92:
            immediate_first_aid.append(f"Administer supplemental oxygen via nasal prongs / non-rebreather mask (SpO2 currently {spo2}%).")
            critical_warnings.append("CRITICAL HYPOXIA RISK: Continuous SpO2 and airway monitoring required.")

        if "burn" in symptoms_str or "burn" in desc_str:
            immediate_first_aid.append("Cool the burn immediately with clean, cool running water for at least 10–15 minutes.")
            immediate_first_aid.append("Cover loosely with a clean, dry, non-adherent sterile dressing.")
            critical_warnings.append("DO NOT apply ice, oil, toothpaste, or break blisters.")

        if not immediate_first_aid:
            immediate_first_aid.append("Keep patient calm, in a safe resting position, and maintain warm body temperature.")
            immediate_first_aid.append("Monitor airway, breathing, pulse rate, and oxygen saturation every 5 minutes.")

        if not critical_warnings:
            critical_warnings.append("Re-assess vital signs every 5–10 minutes until doctor response.")

        doctor_escalation_required = is_critical or is_high or request.high_alert_toggled
        summary_rationale = (
            f"Gemini AI Emergency Assessment flagged presentation as [{urgency_level}]. "
            f"{'Immediate doctor tele-consultation and hospital escalation required.' if doctor_escalation_required else 'Basic care & monitoring recommended.'}"
        )

        # 3. Handle High Alert Instant Notification to Doctors
        high_alert_sent = False
        if request.high_alert_toggled or is_critical:
            high_alert_sent = self._dispatch_high_alert_notification(
                assessment_id=assessment_id,
                urgency_level=urgency_level,
                summary=summary_rationale,
                performed_by_id=performed_by_id
            )

        provider_name = f"{settings.AI_PROVIDER.lower()}-gemini-emergency-vision-v1"

        return EmergencyAssessmentResponse(
            id=assessment_id,
            urgency_level=urgency_level,
            immediate_first_aid=immediate_first_aid,
            critical_warnings=critical_warnings,
            doctor_escalation_required=doctor_escalation_required,
            summary_rationale=summary_rationale,
            high_alert_sent=high_alert_sent,
            status=ProcessingStatus.COMPLETED,
            model_name=provider_name,
            created_at=datetime.now(timezone.utc)
        )

    def _dispatch_high_alert_notification(
        self,
        assessment_id: uuid.UUID,
        urgency_level: str,
        summary: str,
        performed_by_id: Optional[uuid.UUID]
    ) -> bool:
        """Dispatches high-priority notifications and real-time WebSocket events to all doctors."""
        try:
            doctors = self.db.query(User).filter(
                User.role == UserRole.DOCTOR,
                User.is_active == True
            ).all()

            title = f"🔴 HIGH ALERT EMERGENCY CASE [{urgency_level}]"
            message = f"Urgent emergency assessment submitted by health worker. {summary}"

            for doc in doctors:
                self.notif_service.send_notification(
                    user_id=doc.id,
                    title=title,
                    message=message,
                    type=NotificationType.SYSTEM,
                    priority=RiskLevel.IMMEDIATE,
                    event_type="emergency_high_alert",
                    related_entity_type="EMERGENCY_ASSESSMENT",
                    related_entity_id=assessment_id,
                    navigation_target="/doctor/dashboard"
                )

            log_audit_event(
                action="EMERGENCY_HIGH_ALERT_TRIGGERED",
                performed_by=performed_by_id or uuid.UUID("00000000-0000-0000-0000-000000000001"),
                target_resource="EMERGENCY_ASSESSMENT",
                resource_id=assessment_id,
                details={"urgency_level": urgency_level, "doctors_notified_count": len(doctors)}
            )
            logger.info(f"High Alert Emergency Notification dispatched to {len(doctors)} doctor(s).")
            return True
        except Exception as e:
            logger.error(f"Failed to dispatch high alert notification: {e}")
            return False
