from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.consultations.schemas import (
    ConsultationCreate, 
    ConsultationUpdate, 
    StatusUpdateSchema,
    ReviewBeforeSubmissionSchema,
    SymptomValidationRequest,
    VitalsValidationRequest
)
from app.consultations.service import ConsultationService
from app.core.dependencies import get_current_user, require_roles
from app.common.responses import APIResponse
from app.users.models import User
from app.common.enums import UserRole, ConsultationStatus

router = APIRouter(prefix="/consultations", tags=["Consultation Workflow"])
symptoms_router = APIRouter(prefix="/symptoms", tags=["Symptoms & Clinical Reference"])
vitals_router = APIRouter(prefix="/vitals", tags=["Vital Signs Validation"])

COMMON_RURAL_SYMPTOMS = [
    {"name": "Fever", "category": "General", "common_durations": ["1 day", "2 days", "3 days", "1 week"]},
    {"name": "Cough", "category": "Respiratory", "common_durations": ["3 days", "5 days", "2 weeks"]},
    {"name": "Shortness of Breath", "category": "Respiratory", "common_durations": ["1 hour", "1 day", "3 days"]},
    {"name": "Headache", "category": "Neurological", "common_durations": ["1 day", "2 days"]},
    {"name": "Dizziness", "category": "Neurological", "common_durations": ["1 hour", "1 day"]},
    {"name": "Chest Pain / Tightness", "category": "Cardiovascular", "common_durations": ["30 mins", "2 hours", "1 day"]},
    {"name": "Abdominal Pain", "category": "Gastrointestinal", "common_durations": ["1 day", "3 days"]},
    {"name": "Diarrhea", "category": "Gastrointestinal", "common_durations": ["1 day", "2 days", "5 days"]},
    {"name": "Skin Rash", "category": "Dermatology", "common_durations": ["2 days", "1 week"]},
    {"name": "Joint Pain", "category": "Musculoskeletal", "common_durations": ["1 week", "1 month"]}
]

@symptoms_router.get("/common")
def get_common_rural_symptoms():
    return APIResponse.success(data=COMMON_RURAL_SYMPTOMS)

@symptoms_router.post("/validate")
def validate_symptoms_payload(req: SymptomValidationRequest):
    res = ConsultationService.validate_symptoms(req)
    return APIResponse.success(data=res)

@vitals_router.post("/validate")
def validate_vitals_payload(req: VitalsValidationRequest):
    res = ConsultationService.validate_vitals(req)
    return APIResponse.success(data=res)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_consultation_draft(
    consultation_in: ConsultationCreate,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    consultation = service.create_consultation(consultation_in, default_hw_id=current_user.id)
    return APIResponse.created(data=consultation, message="Consultation draft created successfully")

@router.get("")
def list_consultations(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    patient_id: Optional[UUID] = Query(None),
    health_worker_id: Optional[UUID] = Query(None),
    doctor_id: Optional[UUID] = Query(None),
    status: Optional[ConsultationStatus] = Query(None),
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    result = service.list_consultations(
        page=page, 
        limit=limit, 
        patient_id=patient_id, 
        health_worker_id=health_worker_id, 
        doctor_id=doctor_id, 
        status=status
    )
    return APIResponse.success(data=result["items"], meta=result["meta"])

@router.get("/{consultation_id}")
def get_consultation(
    consultation_id: UUID, 
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    consultation = service.get_consultation(consultation_id)
    return APIResponse.success(data=consultation)

@router.put("/{consultation_id}")
def update_consultation_draft(
    consultation_id: UUID, 
    update_in: ConsultationUpdate, 
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    updated = service.update_consultation(consultation_id, update_in, performed_by=current_user.id)
    return APIResponse.success(data=updated, message="Consultation draft updated successfully")

@router.post("/{consultation_id}/submit")
def submit_consultation_for_review(
    consultation_id: UUID,
    review_in: ReviewBeforeSubmissionSchema,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    submitted = service.submit_consultation_review(consultation_id, review_in, performed_by=current_user.id)
    return APIResponse.success(data=submitted, message="Consultation submitted for AI review")

@router.put("/{consultation_id}/status")
def update_consultation_status(
    consultation_id: UUID,
    status_in: StatusUpdateSchema,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    updated = service.update_status(consultation_id, status_in.status, performed_by=current_user.id)
    return APIResponse.success(data=updated, message=f"Status updated to '{status_in.status.value}'")

@router.get("/{consultation_id}/payload")
def get_standardized_ai_payload(
    consultation_id: UUID,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    payload = service.get_standardized_payload(consultation_id)
    return APIResponse.success(data=payload)
