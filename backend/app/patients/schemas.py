from typing import Optional, List, Any, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class PatientBase(BaseModel):
    name: str
    age: Optional[int] = Field(None, ge=0, le=150, description="Age in years")
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    preferred_language: Optional[str] = "en"
    medical_history: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    medications: List[str] = Field(default_factory=list)

class PatientCreate(PatientBase):
    patient_code: Optional[str] = None

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    preferred_language: Optional[str] = None
    medical_history: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    medications: Optional[List[str]] = None

class PatientResponse(PatientBase):
    id: UUID
    patient_code: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PatientTimelineEvent(BaseModel):
    id: str
    event_type: str = Field(..., description="PATIENT_REGISTERED, MEDICAL_HISTORY_UPDATED, CONSULTATION_RECORDED, DOCTOR_REVIEWED")
    title: str
    description: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class PatientTimelineResponse(BaseModel):
    patient_id: UUID
    patient_code: str
    name: str
    timeline: List[PatientTimelineEvent]

class PatientAssignedDoctorInfo(BaseModel):
    doctor_id: UUID
    name: str = Field(..., description="Doctor full name with title e.g. Dr. Rajesh Verma")
    specialization: str
    qualifications: str
    experience_years: int
    license_number: str

class PatientDoctorChatMessage(BaseModel):
    id: str
    sender_id: UUID
    sender_name: str
    sender_role: str = Field(..., description="DOCTOR or PATIENT")
    message_text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PatientDoctorChatMessageRequest(BaseModel):
    consultation_id: UUID
    message_text: str

class PatientDoctorConsultationResponse(BaseModel):
    consultation_id: UUID
    patient_id: UUID
    patient_name: str
    doctor: Optional[PatientAssignedDoctorInfo] = None
    status: str = Field(..., description="Waiting, Doctor Assigned, Scheduled, In Consultation, Completed, Follow-up Required")
    chief_complaint: str
    appointment_date_time: str
    follow_up_date: Optional[str] = None
    doctor_notes: Optional[str] = None
    prescriptions: List[str] = Field(default_factory=list)
    follow_up_instructions: List[str] = Field(default_factory=list)
    chat_messages: List[PatientDoctorChatMessage] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)

