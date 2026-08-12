from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas.consultation import (
    ConsultationCreate, 
    ConsultationUpdate, 
    StatusUpdateSchema,
    ReviewBeforeSubmissionSchema
)
from src.modules.consultations.service import ConsultationService
from src.core.dependencies import get_current_user, require_roles
from src.core.response import APIResponse
from database.models import User, UserRole, ConsultationStatus

router = APIRouter(prefix="/consultations", tags=["Consultation Workflow"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_consultation_draft(
    consultation_in: ConsultationCreate,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Create a new consultation intake in DRAFT status."""
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
    """List paginated consultations filtered by patient, health worker, doctor, or status."""
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
    """Get complete consultation detail record by UUID."""
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
    """Update consultation draft vitals, symptoms, voice transcript, or medical notes."""
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
    """
    Review-before-submission: Confirms intake information and moves status from DRAFT to AI_REVIEW_READY.
    """
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
    """Perform controlled status state machine transitions."""
    service = ConsultationService(db)
    updated = service.update_status(consultation_id, status_in.status, performed_by=current_user.id)
    return APIResponse.success(data=updated, message=f"Status updated to '{status_in.status.value}'")

@router.get("/{consultation_id}/payload")
def get_standardized_ai_payload(
    consultation_id: UUID,
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """
    Retrieve standardized consultation payload formatted specifically for consumption
    by future AI Triage and Risk Engine services.
    """
    service = ConsultationService(db)
    payload = service.get_standardized_payload(consultation_id)
    return APIResponse.success(data=payload)
