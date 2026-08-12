from uuid import UUID
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_health_worker, require_doctor
from app.users.models import User
from app.doctors.schemas import (
    DoctorRequestCreate,
    DoctorRequestResponse,
    DoctorQueueFilter,
    DoctorQueueItem
)
from app.doctors.services.doctor_request_service import DoctorRequestService
from app.common.responses import APIResponse
from app.common.enums import RiskLevel, DoctorRequestStatus

router = APIRouter(prefix="/doctor-requests", tags=["Doctor Requests & Queue"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_doctor_request(
    req_in: DoctorRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_health_worker)
):
    """Create doctor escalation request (Health Worker / Admin)."""
    service = DoctorRequestService(db)
    res = service.create_request(req_in, current_user.id)
    return APIResponse.created(data=res, message="Doctor request created successfully")

@router.get("")
def list_doctor_queue(
    priority: Optional[RiskLevel] = Query(None, description="Filter queue by priority"),
    status_filter: Optional[DoctorRequestStatus] = Query(None, alias="status", description="Filter queue by status"),
    unassigned_only: bool = Query(False, description="Show unassigned queue items only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """List doctor queue filtered by priority, status, and assignment (Doctor / Admin)."""
    service = DoctorRequestService(db)
    filter_in = DoctorQueueFilter(priority=priority, status=status_filter, unassigned_only=unassigned_only)
    queue = service.get_queue(filter_in, current_user.id)
    return APIResponse.success(data=queue)

@router.get("/{request_id}")
def get_doctor_request_details(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve doctor request details."""
    service = DoctorRequestService(db)
    res = service.get_request(request_id, current_user.id)
    return APIResponse.success(data=res)

@router.post("/{request_id}/accept")
def accept_doctor_request(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Doctor accepts and claims a request from the queue (Doctor / Admin)."""
    service = DoctorRequestService(db)
    res = service.accept_request(request_id, current_user.id)
    return APIResponse.success(data=res, message="Doctor request accepted successfully")
