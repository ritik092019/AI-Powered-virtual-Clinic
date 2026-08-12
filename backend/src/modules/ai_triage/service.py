import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from src.modules.ai_triage.repository import AITriageRepository
from src.schemas.ai import AIAssessmentCreate, AIAssessmentResponse, RiskAssessment, ProtocolGuidance
from database.models.enums import RiskLevel, AIAssessmentStatus
from src.core.exceptions import NotFoundException

class AITriageService:
    def __init__(self, db: Session):
        self.repo = AITriageRepository(db)

    def trigger_assessment(self, consultation_id: uuid.UUID) -> AIAssessmentResponse:
        """
        Creates an AI Assessment record contract and dispatches background processing.
        Clinical logic is deferred to future backend/AI engine services.
        """
        data = {
            "consultation_id": consultation_id,
            "summary": "AI Triage Assessment initialized for consultation intake.",
            "observations": ["Intake vitals and symptoms recorded"],
            "missing_information": [],
            "risk_level": RiskLevel.MODERATE,
            "risk_reason": "Pending complete AI model evaluation.",
            "recommendation": "Triage analysis in progress.",
            "confidence": 0.90,
            "model_name": "mock-triage-ai-v1",
            "status": AIAssessmentStatus.COMPLETED
        }
        assessment = self.repo.create(data)
        return AIAssessmentResponse.model_validate(assessment)

    def get_assessment(self, consultation_id: uuid.UUID) -> AIAssessmentResponse:
        assessment = self.repo.get_latest_by_consultation(consultation_id)
        if not assessment:
            raise NotFoundException(f"No AI assessment found for consultation '{consultation_id}'")
        return AIAssessmentResponse.model_validate(assessment)

    def get_protocol_guidance(self, risk_level: RiskLevel) -> ProtocolGuidance:
        """Returns protocol guidance contracts based on risk level."""
        if risk_level == RiskLevel.IMMEDIATE:
            return ProtocolGuidance(
                title="Immediate Emergency Protocol",
                steps=[
                    "Arrange emergency ambulance transport immediately to District Hospital.",
                    "Administer oxygen therapy if SpO2 < 92%.",
                    "Continuous vitals monitoring every 5 minutes."
                ],
                cautions=["Do not delay transfer for paperwork", "Keep airway clear"],
                medication_suggestions=["Emergency stat medications per medical officer instructions"]
            )
        elif risk_level == RiskLevel.HIGH:
            return ProtocolGuidance(
                title="High Priority Physician Review Protocol",
                steps=[
                    "Escalate to on-duty Teleconsultation Doctor within 30 minutes.",
                    "Re-measure blood pressure and pulse."
                ],
                cautions=["Monitor for worsening respiratory distress"],
                medication_suggestions=[]
            )
        else:
            return ProtocolGuidance(
                title="Standard Rural Virtual Intake Protocol",
                steps=[
                    "Record complete history and chief complaint.",
                    "Provide symptomatic relief as per community health worker guidelines."
                ],
                cautions=["Return if fever persists beyond 3 days"],
                medication_suggestions=["Hydration", "Paracetamol if fever > 100F"]
            )
