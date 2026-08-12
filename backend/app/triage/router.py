from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.triage.service import AITriageService
from app.common.enums import RiskLevel
from app.common.responses import APIResponse

router = APIRouter(prefix="/triage", tags=["AI Triage & Assessment"])

@router.post("/consultations/{consultation_id}/analyze", status_code=status.HTTP_202_ACCEPTED)
def trigger_ai_analysis(consultation_id: UUID, db: Session = Depends(get_db)):
    service = AITriageService(db)
    assessment = service.trigger_assessment(consultation_id)
    return APIResponse.success(
        data=assessment, 
        message="AI assessment initiated successfully", 
        status_code=status.HTTP_202_ACCEPTED
    )

@router.get("/consultations/{consultation_id}/assessment")
def get_consultation_ai_assessment(consultation_id: UUID, db: Session = Depends(get_db)):
    service = AITriageService(db)
    assessment = service.get_assessment(consultation_id)
    return APIResponse.success(data=assessment)

@router.get("/protocol-guidance")
def get_protocol_guidance(
    risk_level: RiskLevel = Query(RiskLevel.MODERATE, description="Risk level"),
    db: Session = Depends(get_db)
):
    service = AITriageService(db)
    guidance = service.get_protocol_guidance(risk_level)
    return APIResponse.success(data=guidance)
