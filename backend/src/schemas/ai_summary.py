from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class HealthSummarySection(BaseModel):
    title: str
    content: str
    source_reference: Optional[str] = None
    is_doctor_provided: bool = False

class HealthSummaryResponse(BaseModel):
    summary_id: str
    patient_id: str
    patient_name: str
    generated_at: str
    disclaimer: str = "AI Assist — Does not replace professional medical diagnosis or prescription"
    current_health_overview: str
    recent_vitals_summary: str
    medical_reports_ocr_summary: str
    active_medications: List[str]
    doctor_recommendations: List[str]
    risk_alerts: List[str]
    follow_up_instructions: List[str]
    sections: List[HealthSummarySection]

    model_config = ConfigDict(from_attributes=True)
