from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.patients.schemas import PatientCreate, PatientUpdate, PatientDoctorChatMessageRequest
from app.patients.service import PatientService
from app.core.dependencies import get_current_user, require_roles
from app.common.responses import APIResponse
from app.users.models import User
from app.common.enums import UserRole

router = APIRouter(prefix="/patients", tags=["Patient Management"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate, 
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Register a new patient record with auto-generated patient_code."""
    service = PatientService(db)
    patient = service.create_patient(patient_in, performed_by=current_user.id)
    return APIResponse.created(data=patient, message="Patient created successfully")

@router.get("")
def list_and_search_patients(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by patient name, patient_code, or phone"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    preferred_language: Optional[str] = Query(None, description="Filter by preferred language"),
    age_min: Optional[int] = Query(None, ge=0, le=150, description="Minimum age filter"),
    age_max: Optional[int] = Query(None, ge=0, le=150, description="Maximum age filter"),
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Retrieve paginated patient directory with search and filters."""
    service = PatientService(db)
    result = service.list_patients(
        page=page, 
        limit=limit, 
        search=search,
        gender=gender,
        preferred_language=preferred_language,
        age_min=age_min,
        age_max=age_max
    )
    return APIResponse.success(data=result["items"], meta=result["meta"])

@router.get("/{patient_id}")
def get_patient_profile(
    patient_id: UUID, 
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Retrieve complete patient profile details by UUID."""
    service = PatientService(db)
    patient = service.get_patient(patient_id)
    return APIResponse.success(data=patient)

@router.put("/{patient_id}")
def update_patient_profile(
    patient_id: UUID, 
    update_in: PatientUpdate, 
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Update patient demographics, medical history, allergies, or medications."""
    service = PatientService(db)
    updated = service.update_patient(patient_id, update_in, performed_by=current_user.id)
    return APIResponse.success(data=updated, message="Patient updated successfully")

@router.get("/{patient_id}/timeline")
def get_patient_timeline(
    patient_id: UUID, 
    current_user: User = Depends(require_roles([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Retrieve chronological clinical timeline of patient events."""
    service = PatientService(db)
    timeline = service.get_patient_timeline(patient_id)
    return APIResponse.success(data=timeline)

@router.get("/my-consultations", status_code=status.HTTP_200_OK)
def get_patient_doctor_consultations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve logged-in patient's assigned doctor consultations from PostgreSQL database."""
    from app.patients.services.patient_consultation_service import PatientConsultationService
    patient_id = current_user.id
    res = PatientConsultationService.get_patient_doctor_consultations(patient_id, db=db)
    return APIResponse.success(data=res, message="Patient doctor consultations retrieved")

@router.post("/consultations/chat", status_code=status.HTTP_200_OK)
def send_patient_doctor_chat(
    req: PatientDoctorChatMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send real-time chat message from patient to assigned doctor."""
    from app.patients.services.patient_consultation_service import PatientConsultationService
    patient_id = current_user.id
    res = PatientConsultationService.send_chat_message(patient_id, req)
    return APIResponse.success(data=res, message="Chat message sent to assigned doctor")

