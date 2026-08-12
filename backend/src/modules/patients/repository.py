from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from database.models import Patient, Consultation

class PatientRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, patient_id: UUID) -> Optional[Patient]:
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_by_code(self, patient_code: str) -> Optional[Patient]:
        return self.db.query(Patient).filter(Patient.patient_code == patient_code).first()

    def list_paginated(
        self, 
        skip: int = 0, 
        limit: int = 10, 
        search: Optional[str] = None,
        gender: Optional[str] = None,
        preferred_language: Optional[str] = None,
        age_min: Optional[int] = None,
        age_max: Optional[int] = None
    ) -> Tuple[List[Patient], int]:
        query = self.db.query(Patient)
        
        if search:
            query = query.filter(
                (Patient.name.ilike(f"%{search}%")) |
                (Patient.patient_code.ilike(f"%{search}%")) |
                (Patient.phone.ilike(f"%{search}%"))
            )
        if gender:
            query = query.filter(Patient.gender.ilike(gender))
        if preferred_language:
            query = query.filter(Patient.preferred_language == preferred_language)
        if age_min is not None:
            query = query.filter(Patient.age >= age_min)
        if age_max is not None:
            query = query.filter(Patient.age <= age_max)

        total = query.count()
        patients = query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()
        return patients, total

    def create(self, patient_data: dict) -> Patient:
        patient = Patient(**patient_data)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update(self, patient: Patient, update_data: dict) -> Patient:
        for key, value in update_data.items():
            if value is not None:
                setattr(patient, key, value)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def get_patient_consultation_events(self, patient_id: UUID) -> List[Consultation]:
        """Fetch all consultation events associated with patient for timeline generation."""
        return (
            self.db.query(Consultation)
            .filter(Consultation.patient_id == patient_id)
            .order_by(Consultation.created_at.desc())
            .all()
        )
