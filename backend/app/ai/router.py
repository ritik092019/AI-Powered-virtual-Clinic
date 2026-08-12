from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.ai.services.llm_service import LLMService
from app.ai.services.patient_summary_service import PatientSummaryService
from app.consultations.service import ConsultationService
from app.ai.schemas import EmergencyAssessmentRequest
from app.common.responses import APIResponse
from app.common.enums import RiskLevel

router = APIRouter(prefix="/ai", tags=["AI Processing & Summarization"])

@router.post("/summarize/{patient_id}")
def summarize_patient_history(patient_id: UUID, db: Session = Depends(get_db)):
    """Generate structured patient history summary consuming patient contract API."""
    service = PatientSummaryService(db)
    summary = service.generate_patient_summary(patient_id)
    return APIResponse.success(data=summary, message="Patient summary generated successfully")

@router.post("/assessment/{consultation_id}")
def generate_preliminary_assessment(consultation_id: UUID, db: Session = Depends(get_db)):
    """
    Generate preliminary AI assessment for a consultation, separating verbatim facts
    from AI interpretations and identifying missing clinical data.
    """
    consultation_service = ConsultationService(db)
    payload = consultation_service.get_standardized_payload(consultation_id)
    assessment = LLMService.generate_assessment(payload.model_dump())
    return APIResponse.success(data=assessment, message="AI preliminary assessment generated")

@router.get("/assessment/{assessment_id}")
def get_ai_assessment(assessment_id: UUID, db: Session = Depends(get_db)):
    """Retrieve AI assessment by UUID."""
    # Dummy UUID lookup response for demonstration API contract
    res = LLMService.generate_assessment({"consultation_id": assessment_id})
    res.id = assessment_id
    return APIResponse.success(data=res)

@router.get("/protocol-guidance")
def get_protocol_guidance(
    risk_level: RiskLevel = Query(RiskLevel.MODERATE, description="Risk level"),
    db: Session = Depends(get_db)
):
    from app.triage.service import AITriageService
    service = AITriageService(db)
    guidance = service.get_protocol_guidance(risk_level)
    return APIResponse.success(data=guidance)

@router.post("/emergency-assess", status_code=status.HTTP_200_OK)
def process_emergency_assessment(
    request: EmergencyAssessmentRequest,
    db: Session = Depends(get_db)
):
    """
    Rapid Gemini AI Emergency Assessment for acute patient cases.
    Analyzes images/vitals/symptoms, returns immediate first-aid steps & warnings,
    and dispatches high-alert notifications to doctors when toggled or critical.
    """
    from app.ai.services.emergency_ai_service import EmergencyAIService
    service = EmergencyAIService(db)
    result = service.process_emergency_assessment(request)
    return APIResponse.success(data=result.model_dump(mode='json'), message="Emergency AI assessment completed")

