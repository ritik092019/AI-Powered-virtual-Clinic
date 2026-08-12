from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin, require_roles
from app.users.models import User
from app.common.enums import UserRole, DoctorAvailabilityStatus
from app.common.responses import APIResponse
from app.admin.schemas import (
    DoctorSpecialistCreate,
    DoctorSpecialistUpdate,
    DoctorStatusUpdate
)
from app.admin.services.doctor_management_service import DoctorManagementService

router = APIRouter(prefix="/doctors", tags=["Admin Doctor Specialist Management"])

@router.get("")
def list_and_search_doctors(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name, specialty, license number, email, or phone"),
    specialization: Optional[str] = Query(None, description="Filter by specialty e.g. Cardiology"),
    availability: Optional[DoctorAvailabilityStatus] = Query(None, description="Filter by availability status"),
    is_active: Optional[bool] = Query(None, description="Filter by active account status"),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.DOCTOR, UserRole.HEALTH_WORKER])),
    db: Session = Depends(get_db)
):
    """Retrieve doctor specialist list with search, filter, and pagination."""
    service = DoctorManagementService(db)
    result = service.list_doctors(
        page=page,
        limit=limit,
        search=search,
        specialization=specialization,
        availability=availability,
        is_active=is_active
    )
    return APIResponse.success(data=result.model_dump(), message="Doctor specialists retrieved successfully")

@router.get("/{doctor_id}")
def get_doctor_detail(
    doctor_id: UUID,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.DOCTOR, UserRole.HEALTH_WORKER])),
    db: Session = Depends(get_db)
):
    """Get detailed doctor profile by UUID."""
    service = DoctorManagementService(db)
    doctor = service.get_doctor(doctor_id)
    return APIResponse.success(data=doctor.model_dump(), message="Doctor profile retrieved")

@router.post("", status_code=status.HTTP_201_CREATED)
def create_doctor_specialist(
    doc_in: DoctorSpecialistCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Register a new Doctor Specialist account (Admin Only)."""
    service = DoctorManagementService(db)
    doctor = service.create_doctor(doc_in, admin_id=current_user.id)
    return APIResponse.created(data=doctor.model_dump(), message="Doctor specialist created successfully")

@router.put("/{doctor_id}")
def update_doctor_specialist(
    doctor_id: UUID,
    update_in: DoctorSpecialistUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update doctor specialist profile details (Admin Only)."""
    service = DoctorManagementService(db)
    updated = service.update_doctor(doctor_id, update_in, admin_id=current_user.id)
    return APIResponse.success(data=updated.model_dump(), message="Doctor specialist updated successfully")

@router.patch("/{doctor_id}/status")
def toggle_doctor_status(
    doctor_id: UUID,
    status_in: DoctorStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Activate or deactivate doctor specialist account (Admin Only)."""
    service = DoctorManagementService(db)
    updated = service.toggle_doctor_status(doctor_id, status_in, admin_id=current_user.id)
    status_str = "activated" if status_in.is_active else "deactivated"
    return APIResponse.success(data=updated.model_dump(), message=f"Doctor specialist account {status_str} successfully")
