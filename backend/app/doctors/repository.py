import uuid
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from app.doctors.models import DoctorRequest, DoctorConsultationNote, DoctorAvailability
from app.common.enums import RiskLevel, DoctorRequestStatus, DoctorAvailabilityStatus

class DoctorRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_doctor_request(
        self,
        consultation_id: uuid.UUID,
        patient_id: uuid.UUID,
        requested_by: uuid.UUID,
        priority: RiskLevel,
        reason: str,
        risk_assessment_id: Optional[uuid.UUID] = None
    ) -> DoctorRequest:
        now = datetime.now(timezone.utc)
        req = DoctorRequest(
            id=uuid.uuid4(),
            consultation_id=consultation_id,
            patient_id=patient_id,
            requested_by=requested_by,
            priority=priority,
            reason=reason,
            risk_assessment_id=risk_assessment_id,
            status=DoctorRequestStatus.REQUESTED,
            created_at=now,
            updated_at=now
        )
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def get_doctor_request(self, request_id: uuid.UUID) -> Optional[DoctorRequest]:
        return self.db.query(DoctorRequest).filter(DoctorRequest.id == request_id).first()

    def get_doctor_request_by_consultation(self, consultation_id: uuid.UUID) -> Optional[DoctorRequest]:
        return self.db.query(DoctorRequest).filter(DoctorRequest.consultation_id == consultation_id).order_by(desc(DoctorRequest.created_at)).first()

    def list_doctor_queue(
        self,
        priority: Optional[RiskLevel] = None,
        status: Optional[DoctorRequestStatus] = None,
        doctor_id: Optional[uuid.UUID] = None,
        unassigned_only: bool = False
    ) -> List[DoctorRequest]:
        query = self.db.query(DoctorRequest)

        if priority:
            query = query.filter(DoctorRequest.priority == priority)
        if status:
            query = query.filter(DoctorRequest.status == status)
        if doctor_id:
            query = query.filter(DoctorRequest.doctor_id == doctor_id)
        elif unassigned_only:
            query = query.filter(DoctorRequest.doctor_id.is_(None))

        return query.order_by(desc(DoctorRequest.created_at)).all()

    def accept_doctor_request(self, request_id: uuid.UUID, doctor_id: uuid.UUID) -> DoctorRequest:
        req = self.get_doctor_request(request_id)
        if req:
            req.doctor_id = doctor_id
            req.status = DoctorRequestStatus.ACCEPTED
            req.accepted_at = datetime.now(timezone.utc)
            req.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(req)
        return req

    def update_doctor_request_status(self, request_id: uuid.UUID, status: DoctorRequestStatus) -> DoctorRequest:
        req = self.get_doctor_request(request_id)
        if req:
            req.status = status
            req.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(req)
        return req

    def save_clinical_notes(
        self,
        consultation_id: uuid.UUID,
        doctor_id: uuid.UUID,
        observations: str,
        diagnosis: str,
        treatment_plan: str,
        prescriptions: list,
        follow_up_days: Optional[str] = None
    ) -> DoctorConsultationNote:
        now = datetime.now(timezone.utc)
        note = DoctorConsultationNote(
            id=uuid.uuid4(),
            consultation_id=consultation_id,
            doctor_id=doctor_id,
            clinical_observations=observations,
            diagnosis=diagnosis,
            treatment_plan=treatment_plan,
            prescriptions=prescriptions or [],
            follow_up_days=follow_up_days,
            created_at=now
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return note

    def get_clinical_notes_by_consultation(self, consultation_id: uuid.UUID) -> Optional[DoctorConsultationNote]:
        return self.db.query(DoctorConsultationNote).filter(DoctorConsultationNote.consultation_id == consultation_id).order_by(desc(DoctorConsultationNote.created_at)).first()

    def save_instructions(self, request_id: uuid.UUID, instructions: str) -> DoctorRequest:
        req = self.get_doctor_request(request_id)
        if req:
            req.instructions = instructions
            req.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(req)
        return req

    def save_referral(self, request_id: uuid.UUID, referral_data: dict) -> DoctorRequest:
        req = self.get_doctor_request(request_id)
        if req:
            req.referral = referral_data
            req.status = DoctorRequestStatus.REFERRED
            req.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(req)
        return req

    def set_doctor_availability(
        self,
        user_id: uuid.UUID,
        status: DoctorAvailabilityStatus,
        specialty: Optional[str] = None
    ) -> DoctorAvailability:
        now = datetime.now(timezone.utc)
        avail = self.db.query(DoctorAvailability).filter(DoctorAvailability.user_id == user_id).first()
        if not avail:
            avail = DoctorAvailability(user_id=user_id, status=status, specialty=specialty, last_active_at=now)
            self.db.add(avail)
        else:
            avail.status = status
            if specialty:
                avail.specialty = specialty
            avail.last_active_at = now
        self.db.commit()
        self.db.refresh(avail)
        return avail

    def get_doctor_availability(self, user_id: uuid.UUID) -> Optional[DoctorAvailability]:
        return self.db.query(DoctorAvailability).filter(DoctorAvailability.user_id == user_id).first()
