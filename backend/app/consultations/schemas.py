from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import ConsultationStatus

class Symptom(BaseModel):
    name: str
    severity: int = Field(..., ge=1, le=10, description="Severity rating 1-10")
    duration: str = Field(..., description="Duration e.g., '3 days'")

class SymptomValidationRequest(BaseModel):
    symptoms: List[Symptom]

class SymptomValidationResponse(BaseModel):
    valid: bool
    errors: List[str] = Field(default_factory=list)
    symptoms: List[Symptom]

class VitalValue(BaseModel):
    value: float
    unit: str

class BloodPressureValue(BaseModel):
    systolic: int = Field(..., ge=50, le=250)
    diastolic: int = Field(..., ge=30, le=150)
    unit: str = "mmHg"

class VitalSigns(BaseModel):
    temperature: Optional[VitalValue] = None
    blood_pressure: Optional[BloodPressureValue] = None
    pulse: Optional[VitalValue] = None
    respiratory_rate: Optional[VitalValue] = None
    spo2: Optional[VitalValue] = None

class VitalsValidationRequest(BaseModel):
    vitals: VitalSigns

class VitalsValidationResponse(BaseModel):
    valid: bool
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    vitals: VitalSigns

class MedicalDocument(BaseModel):
    id: str
    name: str
    type: str = Field(..., description="LAB_REPORT, ECG, PRESCRIPTION, OTHER")
    url: Optional[str] = None
    status: str = Field(default="UPLOADING", description="UPLOADING, PROCESSING, READY_FOR_REVIEW, CONFIRMED, FAILED")
    ocr_text: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class PatientImage(BaseModel):
    id: str
    name: str
    url: Optional[str] = None
    analysis_status: str = Field(default="PROCESSING", description="PROCESSING, READY_FOR_REVIEW, CONFIRMED, FAILED")
    observations: List[str] = Field(default_factory=list)
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class ConsultationBase(BaseModel):
    patient_id: UUID
    chief_complaint: Optional[str] = None
    symptoms: List[Symptom] = Field(default_factory=list)
    vitals: VitalSigns = Field(default_factory=VitalSigns)
    voice_transcript: Optional[str] = None
    medical_notes: Optional[str] = None
    documents: List[MedicalDocument] = Field(default_factory=list)
    images: List[PatientImage] = Field(default_factory=list)

class ConsultationCreate(ConsultationBase):
    health_worker_id: Optional[UUID] = None

class ConsultationUpdate(BaseModel):
    doctor_id: Optional[UUID] = None
    status: Optional[ConsultationStatus] = None
    chief_complaint: Optional[str] = None
    symptoms: Optional[List[Symptom]] = None
    vitals: Optional[VitalSigns] = None
    voice_transcript: Optional[str] = None
    medical_notes: Optional[str] = None
    documents: Optional[List[MedicalDocument]] = None
    images: Optional[List[PatientImage]] = None

class StatusUpdateSchema(BaseModel):
    status: ConsultationStatus
    reason: Optional[str] = None

class ReviewBeforeSubmissionSchema(BaseModel):
    confirm_medications: bool = True
    confirm_allergies: bool = True
    notes: Optional[str] = None

class ConsultationResponse(ConsultationBase):
    id: UUID
    health_worker_id: UUID
    doctor_id: Optional[UUID] = None
    status: ConsultationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StandardizedConsultationPayload(BaseModel):
    consultation_id: UUID
    patient_id: UUID
    status: ConsultationStatus
    chief_complaint: Optional[str]
    symptoms: List[Symptom]
    vitals: VitalSigns
    voice_transcript: Optional[str]
    medical_documents_count: int
    patient_images_count: int
    created_at: datetime
