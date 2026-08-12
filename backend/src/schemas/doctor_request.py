from typing import Optional, Any, Dict
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from database.models.enums import RiskLevel, DoctorRequestStatus

class ReferralSchema(BaseModel):
    required: bool = True
    destination: str = Field(..., description="e.g. 'District Hospital Cardiac Unit'")
    reason: str
    urgency: Optional[str] = "High"

class DoctorNote(BaseModel):
    consultation_id: UUID
    doctor_id: UUID
    clinical_observations: str
    diagnosis: str
    treatment_plan: str
    prescriptions: Optional[str] = None
    follow_up_days: Optional[int] = None

class DoctorRequestBase(BaseModel):
    consultation_id: UUID
    patient_id: UUID
    priority: RiskLevel
    reason: str

class DoctorRequestCreate(DoctorRequestBase):
    requested_by: Optional[UUID] = None # Auto-populated from current user context

class DoctorRequestUpdate(BaseModel):
    doctor_id: Optional[UUID] = None
    status: Optional[DoctorRequestStatus] = None
    doctor_notes: Optional[str] = None
    instructions: Optional[str] = None
    referral: Optional[ReferralSchema] = None

class DoctorRequestResponse(DoctorRequestBase):
    id: UUID
    doctor_id: Optional[UUID] = None
    requested_by: UUID
    status: DoctorRequestStatus
    doctor_notes: Optional[str] = None
    instructions: Optional[str] = None
    referral: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
