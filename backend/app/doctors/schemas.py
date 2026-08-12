from typing import Optional, Any, Dict, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import RiskLevel, DoctorRequestStatus, DoctorAvailabilityStatus

class ReferralDecisionSchema(BaseModel):
    required: bool = Field(True, description="Indicates if hospital referral is recommended")
    destination_facility: str = Field(..., description="Target facility e.g. District Hospital Critical Care Unit")
    transfer_urgency: str = Field("IMMEDIATE", description="IMMEDIATE, HIGH, MODERATE")
    clinical_reasoning: str = Field(..., description="Doctor's authoritative justification for referral")
    specialty_required: Optional[str] = "Cardiology"

class DoctorNotesCreate(BaseModel):
    clinical_observations: str = Field(..., description="Doctor-authored physical & symptom observations")
    diagnosis: str = Field(..., description="Authoritative doctor clinical diagnosis")
    treatment_plan: str = Field(..., description="Authoritative clinical treatment plan")
    prescriptions: List[Dict[str, Any]] = Field(default_factory=list, description="Prescribed medications list")
    follow_up_days: Optional[str] = "7 days"

class DoctorNotesResponse(DoctorNotesCreate):
    id: UUID
    consultation_id: UUID
    doctor_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DoctorInstructionsCreate(BaseModel):
    instructions: str = Field(..., description="Authoritative healthcare worker and patient instructions")

class DoctorRequestCreate(BaseModel):
    consultation_id: UUID
    patient_id: UUID
    risk_assessment_id: Optional[UUID] = None
    priority: Optional[RiskLevel] = RiskLevel.MODERATE
    reason: str

class DoctorRequestResponse(BaseModel):
    id: UUID
    consultation_id: UUID
    patient_id: UUID
    risk_assessment_id: Optional[UUID] = None
    doctor_id: Optional[UUID] = None
    requested_by: UUID
    priority: RiskLevel
    reason: str
    status: DoctorRequestStatus
    accepted_at: Optional[datetime] = None
    doctor_notes: Optional[str] = None
    instructions: Optional[str] = None
    referral: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DoctorQueueFilter(BaseModel):
    priority: Optional[RiskLevel] = None
    status: Optional[DoctorRequestStatus] = None
    unassigned_only: Optional[bool] = False

class DoctorQueueItem(BaseModel):
    request_id: UUID
    consultation_id: UUID
    patient_id: UUID
    patient_name: Optional[str] = "Intake Patient"
    patient_code: Optional[str] = "PAT-0000"
    priority: RiskLevel
    status: DoctorRequestStatus
    reason: str
    doctor_id: Optional[UUID] = None
    requested_by: UUID
    wait_time_minutes: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DoctorAvailabilityUpdate(BaseModel):
    status: DoctorAvailabilityStatus
    specialty: Optional[str] = None

class DoctorAvailabilityResponse(BaseModel):
    user_id: UUID
    status: DoctorAvailabilityStatus
    specialty: Optional[str] = None
    last_active_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WebRTCSessionSchema(BaseModel):
    room_id: str
    consultation_id: UUID
    ice_servers: List[Dict[str, Any]] = Field(
        default_factory=lambda: [
            {"urls": "stun:stun.l.google.com:19302"},
            {"urls": "stun:stun1.l.google.com:19302"}
        ]
    )
    status: str = "WAITING_FOR_PEER" # WAITING_FOR_PEER, CONNECTED, DISCONNECTED

class DoctorConsultationResponse(BaseModel):
    consultation_id: UUID
    patient_id: UUID
    request_id: UUID
    status: DoctorRequestStatus
    doctor_id: Optional[UUID] = None
    
    # Clearly separated AI intake vs Doctor decisions
    ai_preliminary_assessment: Optional[Dict[str, Any]] = Field(
        None, description="Non-binding AI preliminary observations, facts, and missing data"
    )
    doctor_clinical_notes: Optional[DoctorNotesResponse] = Field(
        None, description="Authoritative doctor clinical notes, diagnosis, and treatment plan"
    )
    doctor_instructions: Optional[str] = Field(
        None, description="Authoritative doctor instructions for health worker/patient"
    )
    referral_decision: Optional[Dict[str, Any]] = Field(
        None, description="Authoritative referral decision"
    )
    webrtc_session: Optional[WebRTCSessionSchema] = Field(
        None, description="WebRTC audio/video call session metadata"
    )
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
