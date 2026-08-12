from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from database.models import DoctorRequest, DoctorRequestStatus, RiskLevel

class DoctorRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, request_id: UUID) -> Optional[DoctorRequest]:
        return self.db.query(DoctorRequest).filter(DoctorRequest.id == request_id).first()

    def get_by_consultation(self, consultation_id: UUID) -> Optional[DoctorRequest]:
        return self.db.query(DoctorRequest).filter(DoctorRequest.consultation_id == consultation_id).first()

    def list_paginated(
        self,
        skip: int = 0,
        limit: int = 10,
        doctor_id: Optional[UUID] = None,
        status: Optional[DoctorRequestStatus] = None,
        priority: Optional[RiskLevel] = None
    ) -> Tuple[List[DoctorRequest], int]:
        query = self.db.query(DoctorRequest)
        if doctor_id:
            query = query.filter(DoctorRequest.doctor_id == doctor_id)
        if status:
            query = query.filter(DoctorRequest.status == status)
        if priority:
            query = query.filter(DoctorRequest.priority == priority)

        total = query.count()
        items = query.order_by(DoctorRequest.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create(self, request_data: dict) -> DoctorRequest:
        doc_req = DoctorRequest(**request_data)
        self.db.add(doc_req)
        self.db.commit()
        self.db.refresh(doc_req)
        return doc_req

    def update(self, doc_req: DoctorRequest, update_data: dict) -> DoctorRequest:
        for key, value in update_data.items():
            if value is not None:
                setattr(doc_req, key, value)
        self.db.commit()
        self.db.refresh(doc_req)
        return doc_req
