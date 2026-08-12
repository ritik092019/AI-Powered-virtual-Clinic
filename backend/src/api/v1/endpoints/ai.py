from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.modules.ai_triage.service import AITriageService
from database.models.enums import RiskLevel
from src.core.response import APIResponse

router = APIRouter(prefix="/ai", tags=["AI Triage & Analysis"])

@router.post("/consultations/{consultation_id}/analyze", status_code=status.HTTP_202_ACCEPTED)
def trigger_ai_analysis(consultation_id: UUID, db: Session = Depends(get_db)):
    """Trigger AI triage assessment and protocol analysis for a consultation."""
    service = AITriageService(db)
    assessment = service.trigger_assessment(consultation_id)
    return APIResponse.success(
        data=assessment, 
        message="AI assessment initiated successfully", 
        status_code=status.HTTP_202_ACCEPTED
    )

@router.get("/consultations/{consultation_id}/assessment")
def get_consultation_ai_assessment(consultation_id: UUID, db: Session = Depends(get_db)):
    """Retrieve the latest AI triage assessment for a consultation."""
    service = AITriageService(db)
    assessment = service.get_assessment(consultation_id)
    return APIResponse.success(data=assessment)

@router.get("/protocol-guidance")
def get_protocol_guidance(
    risk_level: RiskLevel = Query(RiskLevel.MODERATE, description="Risk level (LOW, MODERATE, HIGH, IMMEDIATE)"),
    db: Session = Depends(get_db)
):
    """Retrieve clinical protocol guidance recommendations based on risk level."""
    service = AITriageService(db)
    guidance = service.get_protocol_guidance(risk_level)
    return APIResponse.success(data=guidance)
