from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.common.enums import AppointmentStatus

class AppointmentCreateRequest(BaseModel):
    consultation_type: str = Field("tele_consultation", description="tele_consultation or in_person_visit")
    symptoms: str = Field(..., min_length=3, description="Patient reported symptoms")
    duration: Optional[str] = Field(None, description="Duration of symptoms e.g. 3 days")
    severity: Optional[str] = Field("Moderate", description="Mild, Moderate, Severe, Urgent")
    age: Optional[int] = Field(None, ge=0, le=120)
    existing_conditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    vitals: Dict[str, Any] = Field(default_factory=dict)
    voice_transcript: Optional[str] = None
    preferred_language: str = Field("English", description="Hindi, Telugu, Tamil, Marathi, English")
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None

class DoctorInfo(BaseModel):
    doctor_id: UUID
    name: str
    specialty: str
    qualifications: str = "MBBS, MD"
    experience_years: int = 10
    license_number: str = "MCI-889021"
    language: Optional[str] = "English"

class AppointmentResponse(BaseModel):
    id: UUID
    patient_id: UUID
    patient_name: Optional[str] = "Patient"
    doctor_id: Optional[UUID] = None
    doctor: Optional[DoctorInfo] = None
    status: AppointmentStatus
    consultation_type: str
    symptoms: str
    duration: Optional[str] = None
    severity: Optional[str] = None
    age: Optional[int] = None
    existing_conditions: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    current_medications: List[str] = Field(default_factory=list)
    vitals: Dict[str, Any] = Field(default_factory=dict)
    voice_transcript: Optional[str] = None
    preferred_language: str
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    classified_specialty: Optional[str] = None
    classification_source: str = "GEMINI_AI"
    classification_confidence: float = 0.9
    match_score: Optional[float] = None
    matching_notes: Optional[str] = None
    webrtc_room_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DoctorActionRequest(BaseModel):
    action: str = Field(..., description="'accept' or 'decline'")
    reason: Optional[str] = None
