from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import RiskLevel, AIAssessmentStatus

class RiskAssessment(BaseModel):
    risk_level: RiskLevel
    risk_reason: str
    escalation_required: bool
    recommended_timeframe: str = Field(..., description="e.g. 'Immediate', 'Within 24 Hours'")

class ProtocolGuidance(BaseModel):
    title: str
    steps: List[str]
    cautions: List[str]
    medication_suggestions: List[str] = Field(default_factory=list)

class AIAssessmentBase(BaseModel):
    consultation_id: UUID
    summary: Optional[str] = None
    observations: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    risk_level: RiskLevel
    risk_reason: Optional[str] = None
    recommendation: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    model_name: Optional[str] = "mock-triage-ai-v1"

class AIAssessmentCreate(AIAssessmentBase):
    pass

class AIAssessmentResponse(AIAssessmentBase):
    id: UUID
    status: AIAssessmentStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
