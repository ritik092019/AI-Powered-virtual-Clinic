import uuid
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum, Index, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import AppointmentStatus

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    status = Column(
        SQLEnum(AppointmentStatus, name="appointment_status"),
        nullable=False,
        default=AppointmentStatus.PENDING_QUEUE,
        index=True
    )
    
    consultation_type = Column(String(50), nullable=False, default="tele_consultation")
    symptoms = Column(Text, nullable=False)
    duration = Column(String(100), nullable=True)
    severity = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    
    existing_conditions = Column(JSONB, server_default='[]', nullable=False)
    allergies = Column(JSONB, server_default='[]', nullable=False)
    current_medications = Column(JSONB, server_default='[]', nullable=False)
    vitals = Column(JSONB, server_default='{}', nullable=False)
    
    voice_transcript = Column(Text, nullable=True)
    preferred_language = Column(String(50), nullable=False, default="English")
    preferred_date = Column(String(50), nullable=True)
    preferred_time = Column(String(50), nullable=True)
    
    classified_specialty = Column(String(100), nullable=True)
    classification_source = Column(String(50), nullable=False, default="GEMINI_AI")
    classification_confidence = Column(Float, nullable=False, default=0.9)
    
    match_score = Column(Float, nullable=True)
    matching_notes = Column(Text, nullable=True)
    webrtc_room_id = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_appointments_patient_status', 'patient_id', 'status'),
        Index('idx_appointments_doctor_status', 'doctor_id', 'status'),
    )

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])

    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, doctor_id={self.doctor_id}, status='{self.status}')>"
