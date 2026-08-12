from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import RiskLevel, ProcessingStatus

class AIAssessmentRequest(BaseModel):
    consultation_id: UUID
    force_recompute: Optional[bool] = False

class AIAssessmentResponse(BaseModel):
    id: UUID
    consultation_id: UUID
    extracted_facts: List[str] = Field(default_factory=list, description="Verbatim facts from patient vitals and symptoms")
    ai_interpretation: List[str] = Field(default_factory=list, description="AI clinical analysis and observations")
    missing_information: List[str] = Field(default_factory=list, description="Explicitly identified missing clinical data")
    risk_level: RiskLevel = Field(default=RiskLevel.MODERATE)
    risk_reason: str = Field(default="Preliminary AI evaluation completed.")
    recommendation: str = Field(default="Recommend clinical review by attending medical officer.")
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    model_name: str = Field(default="mock-triage-llm-v1")
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)

class PatientSummaryRequest(BaseModel):
    patient_id: UUID

class PatientSummaryResponse(BaseModel):
    patient_id: UUID
    patient_code: str
    name: str
    summary_text: str
    extracted_facts: Dict[str, Any] = Field(default_factory=dict, description="Medical history, chronic conditions, and allergies")
    missing_information: List[str] = Field(default_factory=list, description="Gaps in patient record")
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)

# ===========================================================================
# Emergency AI Triage & Assessment Schemas
# ===========================================================================

class EmergencyAssessmentRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded image or photo of patient/injury")
    age: Optional[int] = Field(None, description="Patient age in years")
    symptoms: List[str] = Field(default_factory=list, description="Quick symptoms tags e.g. Chest Pain, Bleeding")
    vitals: Dict[str, Any] = Field(default_factory=dict, description="Rapid vitals e.g. spo2, bp, temp")
    injury_description: Optional[str] = Field(None, description="Brief description of emergency/injury")
    high_alert_toggled: bool = Field(default=False, description="Whether High Alert is manually toggled ON by health worker")
    patient_id: Optional[UUID] = Field(None, description="Optional patient UUID if selected")

class EmergencyAssessmentResponse(BaseModel):
    id: UUID
    urgency_level: str = Field(..., description="CRITICAL_EMERGENCY, HIGH_PRIORITY, or MODERATE_URGENT")
    problem_explanation: str = Field(default="Acute clinical emergency identified requiring immediate structured intervention.", description="Detailed clinical explanation of identified health problem")
    solutions_to_adapt: List[str] = Field(default_factory=list, description="Recommended clinical procedures and solutions to adapt immediately")
    things_to_avoid: List[str] = Field(default_factory=list, description="Critical actions and harmful practices to strictly avoid")
    immediate_first_aid: List[str] = Field(default_factory=list, description="Step-by-step first-aid actions for health worker")
    critical_warnings: List[str] = Field(default_factory=list, description="Red flag clinical warnings")
    doctor_escalation_required: bool = Field(..., description="Whether immediate doctor escalation is required")
    summary_rationale: str = Field(..., description="AI emergency rationale summary")
    high_alert_sent: bool = Field(..., description="Whether high alert instant notifications were dispatched to doctors")
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    model_name: str = Field(default="gemini-emergency-vision-v1")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)

