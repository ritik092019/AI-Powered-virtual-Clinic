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
