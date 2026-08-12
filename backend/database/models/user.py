import uuid
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from database.base import Base
from database.models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole, name="user_role"), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    language = Column(String(10), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    profile_metadata = Column(JSONB, server_default='{}', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    hw_consultations = relationship(
        "Consultation", 
        foreign_keys="Consultation.health_worker_id", 
        back_populates="health_worker"
    )
    dr_consultations = relationship(
        "Consultation", 
        foreign_keys="Consultation.doctor_id", 
        back_populates="doctor"
    )
    assigned_doctor_requests = relationship(
        "DoctorRequest", 
        foreign_keys="DoctorRequest.doctor_id", 
        back_populates="doctor"
    )
    submitted_doctor_requests = relationship(
        "DoctorRequest", 
        foreign_keys="DoctorRequest.requested_by", 
        back_populates="requested_by_user"
    )
    notifications = relationship(
        "Notification", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
