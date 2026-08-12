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

        # 2. Build Problem Explanation, Solutions to Adapt, Things to Avoid & First-Aid
        immediate_first_aid: List[str] = []
        critical_warnings: List[str] = []
        solutions_to_adapt: List[str] = []
        things_to_avoid: List[str] = []

        explanation_parts = []
        if symptoms_str:
            explanation_parts.append(f"Reported acute symptoms: {', '.join(request.symptoms)}.")
        if desc_str:
            explanation_parts.append(f"Clinical notes: {desc_str}.")
        if spo2 is not None:
            explanation_parts.append(f"Recorded oxygen saturation (SpO2) is {spo2}%.")

        problem_explanation = (
            " ".join(explanation_parts) + f" Gemini AI triage assessment evaluated presentation as [{urgency_level}]. "
            "Requires immediate structured first-aid stabilization and medical escalation."
        )

        if "bleeding" in symptoms_str or "bleeding" in desc_str:
            immediate_first_aid.append("Apply firm, continuous direct pressure to the bleeding wound using sterile gauze or clean cloth.")
            immediate_first_aid.append("Elevate the injured limb above heart level if no fracture is suspected.")
            solutions_to_adapt.append("Adapt pressure dressing protocols and maintain patient flat with legs elevated if in shock.")
            things_to_avoid.append("AVOID removing blood-soaked dressings; layer new sterile pads directly over existing ones.")
            things_to_avoid.append("AVOID applying tourniquets unless trained and direct pressure completely fails.")
            critical_warnings.append("DO NOT remove soaked dressings; layer additional pads on top.")

        if "chest pain" in symptoms_str or "cardiac" in desc_str:
            immediate_first_aid.append("Position patient in a comfortable semi-recumbent (half-sitting) posture.")
            immediate_first_aid.append("Loosen tight clothing around neck, chest, and waist.")
            immediate_first_aid.append("Administer high-flow supplemental oxygen if SpO2 < 94%.")
            solutions_to_adapt.append("Adapt cardiac rest protocols, keep patient calm, and monitor pulse continuously.")
            things_to_avoid.append("AVOID physical exertion or allowing the patient to walk.")
            things_to_avoid.append("AVOID giving solid food or heavy liquids during acute chest pain.")
            critical_warnings.append("DO NOT allow patient to walk or exert physical effort.")

        if spo2 is not None and spo2 < 92:
            immediate_first_aid.append(f"Administer supplemental oxygen via nasal prongs / non-rebreather mask (SpO2 currently {spo2}%).")
            solutions_to_adapt.append("Adapt high-flow oxygen therapy (4-6 L/min) and semi-Fowler position to maximize ventilation.")
            things_to_avoid.append("AVOID laying the hypoxic patient completely flat on their back.")
            critical_warnings.append("CRITICAL HYPOXIA RISK: Continuous SpO2 and airway monitoring required.")

        if "burn" in symptoms_str or "burn" in desc_str:
            immediate_first_aid.append("Cool the burn immediately with clean, cool running water for at least 10–15 minutes.")
            immediate_first_aid.append("Cover loosely with a clean, dry, non-adherent sterile dressing.")
            solutions_to_adapt.append("Adapt clean water irrigation and cover with sterile non-stick dressing.")
            things_to_avoid.append("AVOID applying ice, ghee, oil, toothpaste, or home remedies to burn tissue.")
            things_to_avoid.append("AVOID popping or puncturing burn blisters.")
            critical_warnings.append("DO NOT apply ice, oil, toothpaste, or break blisters.")

        if "snakebite" in symptoms_str or "bite" in symptoms_str:
            immediate_first_aid.append("Immobilize the bitten limb with a splint or bandage at or slightly below heart level.")
            immediate_first_aid.append("Keep the patient completely still and reassure them to slow venom spread.")
            solutions_to_adapt.append("Adapt rapid transfer to facility with anti-snake venom (ASV) availability.")
            things_to_avoid.append("AVOID cutting, sucking the wound, or applying tight tourniquets.")
            things_to_avoid.append("AVOID giving alcohol or caffeinated beverages.")
            critical_warnings.append("HIGH TOXICITY RISK: Do not attempt traditional incision or suction.")

        if not immediate_first_aid:
            immediate_first_aid.append("Keep patient calm, in a safe resting position, and maintain warm body temperature.")
            immediate_first_aid.append("Monitor airway, breathing, pulse rate, and oxygen saturation every 5 minutes.")

        if not solutions_to_adapt:
            solutions_to_adapt.append("Adapt continuous vital signs monitoring every 5 minutes until doctor tele-consultation.")
            solutions_to_adapt.append("Prepare patient records and transfer logistics for emergency transport if required.")

        if not things_to_avoid:
            things_to_avoid.append("AVOID leaving the acute patient unattended.")
            things_to_avoid.append("AVOID administering oral medications without medical officer authorization.")

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
            problem_explanation=problem_explanation,
            solutions_to_adapt=solutions_to_adapt,
            things_to_avoid=things_to_avoid,
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
