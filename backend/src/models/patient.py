import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, CheckConstraint, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from src.db.base import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    preferred_language = Column(String(10), nullable=True)
    
    medical_history = Column(JSONB, server_default='[]', nullable=False)
    allergies = Column(JSONB, server_default='[]', nullable=False)
    medications = Column(JSONB, server_default='[]', nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint('age IS NULL OR (age >= 0 AND age <= 150)', name='check_patient_age_valid'),
    )

    # Relationships
    consultations = relationship("Consultation", back_populates="patient")
    doctor_requests = relationship("DoctorRequest", back_populates="patient")

    def __repr__(self):
        return f"<Patient(id={self.id}, patient_code='{self.patient_code}', name='{self.name}')>"
