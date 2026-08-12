from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from database.models import Consultation, ConsultationStatus

class ConsultationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, consultation_id: UUID) -> Optional[Consultation]:
        return self.db.query(Consultation).filter(Consultation.id == consultation_id).first()

    def list_paginated(
        self, 
        skip: int = 0, 
        limit: int = 10, 
        patient_id: Optional[UUID] = None,
        health_worker_id: Optional[UUID] = None,
        doctor_id: Optional[UUID] = None,
        status: Optional[ConsultationStatus] = None
    ) -> Tuple[List[Consultation], int]:
        query = self.db.query(Consultation)
        if patient_id:
            query = query.filter(Consultation.patient_id == patient_id)
        if health_worker_id:
            query = query.filter(Consultation.health_worker_id == health_worker_id)
        if doctor_id:
            query = query.filter(Consultation.doctor_id == doctor_id)
        if status:
            query = query.filter(Consultation.status == status)

        total = query.count()
        items = query.order_by(Consultation.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create(self, consultation_data: dict) -> Consultation:
        consultation = Consultation(**consultation_data)
        self.db.add(consultation)
        self.db.commit()
        self.db.refresh(consultation)
        return consultation

    def update(self, consultation: Consultation, update_data: dict) -> Consultation:
        for key, value in update_data.items():
            if value is not None:
                setattr(consultation, key, value)
        self.db.commit()
        self.db.refresh(consultation)
        return consultation

    def update_status(self, consultation: Consultation, new_status: ConsultationStatus) -> Consultation:
        consultation.status = new_status
        self.db.commit()
        self.db.refresh(consultation)
        return consultation
