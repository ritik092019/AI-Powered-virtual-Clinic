import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from src.db.base import Base
from src.models.enums import RiskLevel, DoctorRequestStatus

class DoctorRequest(Base):
    __tablename__ = "doctor_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    priority = Column(SQLEnum(RiskLevel, name="risk_level"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    
    status = Column(
        SQLEnum(DoctorRequestStatus, name="doctor_request_status"), 
        nullable=False, 
        default=DoctorRequestStatus.REQUESTED, 
        index=True
    )
    
    doctor_notes = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    referral = Column(JSONB, nullable=True, default=None)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_doctor_requests_doctor_status', 'doctor_id', 'status'),
        Index('idx_doctor_requests_priority_status', 'priority', 'status'),
    )

    # Relationships
    consultation = relationship("Consultation", back_populates="doctor_requests")
    patient = relationship("Patient", back_populates="doctor_requests")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="assigned_doctor_requests")
    requested_by_user = relationship("User", foreign_keys=[requested_by], back_populates="submitted_doctor_requests")

    def __repr__(self):
        return f"<DoctorRequest(id={self.id}, priority='{self.priority}', status='{self.status}')>"
