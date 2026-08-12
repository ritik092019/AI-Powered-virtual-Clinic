import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from src.modules.doctor_requests.repository import DoctorRequestRepository
from src.schemas.doctor_request import (
    DoctorRequestCreate, 
    DoctorRequestUpdate, 
    DoctorRequestResponse
)
from database.models.enums import DoctorRequestStatus, RiskLevel
from src.core.exceptions import NotFoundException
from src.core.pagination import create_paginated_response

class DoctorRequestService:
    def __init__(self, db: Session):
        self.repo = DoctorRequestRepository(db)

    def create_request(self, request_in: DoctorRequestCreate, default_user_id: uuid.UUID) -> DoctorRequestResponse:
        data = request_in.model_dump()
        if not data.get("requested_by"):
            data["requested_by"] = default_user_id
        data["status"] = DoctorRequestStatus.REQUESTED

        doc_req = self.repo.create(data)
        return DoctorRequestResponse.model_validate(doc_req)

    def get_request(self, request_id: uuid.UUID) -> DoctorRequestResponse:
        doc_req = self.repo.get_by_id(request_id)
        if not doc_req:
            raise NotFoundException(f"Doctor request with ID '{request_id}' not found")
        return DoctorRequestResponse.model_validate(doc_req)

    def update_request(self, request_id: uuid.UUID, update_in: DoctorRequestUpdate) -> DoctorRequestResponse:
        doc_req = self.repo.get_by_id(request_id)
        if not doc_req:
            raise NotFoundException(f"Doctor request with ID '{request_id}' not found")
        
        update_data = update_in.model_dump(exclude_unset=True)
        if "referral" in update_data and update_data["referral"] is not None:
            update_data["referral"] = update_data["referral"].model_dump() if hasattr(update_data["referral"], "model_dump") else update_data["referral"]

        updated = self.repo.update(doc_req, update_data)
        return DoctorRequestResponse.model_validate(updated)

    def list_requests(
        self,
        page: int = 1,
        limit: int = 10,
        doctor_id: Optional[uuid.UUID] = None,
        status: Optional[DoctorRequestStatus] = None,
        priority: Optional[RiskLevel] = None
    ) -> Dict[str, Any]:
        skip = (page - 1) * limit
        items, total = self.repo.list_paginated(
            skip=skip,
            limit=limit,
            doctor_id=doctor_id,
            status=status,
            priority=priority
        )
        responses = [DoctorRequestResponse.model_validate(r) for r in items]
        return create_paginated_response(responses, total, page, limit)
