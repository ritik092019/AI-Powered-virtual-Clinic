from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas.doctor_request import DoctorRequestCreate, DoctorRequestUpdate
from src.modules.doctor_requests.service import DoctorRequestService
from database.models.enums import DoctorRequestStatus, RiskLevel
from src.core.response import APIResponse

router = APIRouter(prefix="/doctor-requests", tags=["Doctor Requests & Review"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_doctor_request(request_in: DoctorRequestCreate, db: Session = Depends(get_db)):
    """Submit a new doctor escalation request for a consultation."""
    service = DoctorRequestService(db)
    default_user_id = request_in.requested_by or UUID("00000000-0000-0000-0000-000000000001")
    request_res = service.create_request(request_in, default_user_id)
    return APIResponse.created(data=request_res, message="Doctor request submitted successfully")

@router.get("")
def list_doctor_requests(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    doctor_id: Optional[UUID] = Query(None),
    status: Optional[DoctorRequestStatus] = Query(None),
    priority: Optional[RiskLevel] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve paginated doctor escalation requests filtered by doctor, status, or priority."""
    service = DoctorRequestService(db)
    result = service.list_requests(
        page=page, 
        limit=limit, 
        doctor_id=doctor_id, 
        status=status, 
        priority=priority
    )
    return APIResponse.success(data=result["items"], meta=result["meta"])

@router.get("/{request_id}")
def get_doctor_request(request_id: UUID, db: Session = Depends(get_db)):
    """Retrieve single doctor request details by UUID."""
    service = DoctorRequestService(db)
    doc_req = service.get_request(request_id)
    return APIResponse.success(data=doc_req)

@router.put("/{request_id}")
def update_doctor_request(
    request_id: UUID, 
    update_in: DoctorRequestUpdate, 
    db: Session = Depends(get_db)
):
    """Update doctor request status, assign doctor, or add notes and referral info."""
    service = DoctorRequestService(db)
    updated = service.update_request(request_id, update_in)
    return APIResponse.success(data=updated, message="Doctor request updated successfully")
