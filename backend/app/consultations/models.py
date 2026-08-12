import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import ConsultationStatus

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False, index=True)
    health_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status = Column(
        SQLEnum(ConsultationStatus, name="consultation_status"), 
        nullable=False, 
        default=ConsultationStatus.DRAFT, 
        index=True
    )
    
    chief_complaint = Column(Text, nullable=True)
    symptoms = Column(JSONB, server_default='[]', nullable=False)
    vitals = Column(JSONB, server_default='{}', nullable=False)
    voice_transcript = Column(Text, nullable=True)
    medical_notes = Column(Text, nullable=True)
    documents = Column(JSONB, server_default='[]', nullable=False)
    images = Column(JSONB, server_default='[]', nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_consultations_hw_status', 'health_worker_id', 'status'),
    )

    # Relationships
    patient = relationship("Patient", back_populates="consultations")
    health_worker = relationship("User", foreign_keys=[health_worker_id], back_populates="hw_consultations")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="dr_consultations")
    ai_assessments = relationship("AIAssessment", back_populates="consultation", cascade="all, delete-orphan")
    doctor_requests = relationship("DoctorRequest", back_populates="consultation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Consultation(id={self.id}, patient_id={self.patient_id}, status='{self.status}')>"
