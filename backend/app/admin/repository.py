import uuid
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.users.models import User
from app.patients.models import Patient
from app.consultations.models import Consultation
from app.doctors.models import DoctorRequest, DoctorAvailability
from app.common.enums import UserRole, ConsultationStatus, DoctorRequestStatus, DoctorAvailabilityStatus

class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_users(self, role: Optional[UserRole] = None, limit: int = 50, offset: int = 0) -> Tuple[List[User], int]:
        query = self.db.query(User)
        if role:
            query = query.filter(User.role == role)
        total = query.count()
        users = query.order_by(desc(User.created_at)).offset(offset).limit(limit).all()
        return users, total

    def get_user(self, user_id: uuid.UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(
        self,
        name: str,
        email: str,
        hashed_password: str,
        role: UserRole,
        phone: Optional[str] = None,
        is_active: bool = True
    ) -> User:
        now = datetime.now(timezone.utc)
        user = User(
            id=uuid.uuid4(),
            name=name,
            email=email,
            password=hashed_password,
            role=role,
            phone=phone,
            is_active=is_active,
            created_at=now,
            updated_at=now
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user_status(self, user_id: uuid.UUID, is_active: bool) -> Optional[User]:
        user = self.get_user(user_id)
        if user:
            user.is_active = is_active
            user.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(user)
        return user

    def get_platform_metrics(self) -> Dict[str, Any]:
        total_patients = self.db.query(Patient).count()
        total_consultations = self.db.query(Consultation).count()
        pending_doctor_requests = self.db.query(DoctorRequest).filter(DoctorRequest.status == DoctorRequestStatus.REQUESTED).count()
        completed_consultations = self.db.query(Consultation).filter(Consultation.status == ConsultationStatus.COMPLETED).count()
        active_doctors = self.db.query(DoctorAvailability).filter(DoctorAvailability.status == DoctorAvailabilityStatus.AVAILABLE).count()

        roles_counts = {}
        for r in UserRole:
            roles_counts[r.value] = self.db.query(User).filter(User.role == r).count()

        return {
            "total_patients": total_patients,
            "total_consultations": total_consultations,
            "pending_doctor_requests": pending_doctor_requests,
            "completed_consultations": completed_consultations,
            "active_doctors": active_doctors,
            "total_users_by_role": roles_counts
        }
