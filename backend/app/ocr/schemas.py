from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import ProcessingStatus

class LabResultItem(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    flag: Optional[str] = None # NORMAL, HIGH, LOW, CRITICAL

class OCRProcessRequest(BaseModel):
    document_url: str
    document_type: Optional[str] = "LAB_REPORT" # LAB_REPORT, PRESCRIPTION, ECG, GENERAL

class DocumentExtractionResponse(BaseModel):
    document_id: str
    document_url: str
    document_type: str
    raw_text: str
    extracted_facts: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Structured facts e.g. lab_results, medications, diagnosis"
    )
    ai_interpretation: Optional[str] = Field(None, description="AI summary of extracted document content")
    confidence: float = Field(default=0.91, ge=0.0, le=1.0)
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


class DetectedMedication(BaseModel):
    name: str = Field(..., description="Medication name e.g. Amoxicillin 500mg")
    dosage: str = Field(..., description="Dosage and frequency e.g. 1 tablet twice daily after food")
    purpose: Optional[str] = Field(None, description="Simple explanation of why it is prescribed")
    duration: Optional[str] = Field(None, description="Treatment duration e.g. 5 days")


class PatientDocumentSummaryRequest(BaseModel):
    document_id: Optional[str] = "DOC-1001"
    raw_text: Optional[str] = None
    document_type: Optional[str] = "PRESCRIPTION" # LAB_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY, GENERAL


class PatientDocumentSummaryResponse(BaseModel):
    document_id: str
    document_name: str
    patient_friendly_summary: str = Field(..., description="Clear plain-language explanation of the document")
    important_findings: List[str] = Field(default_factory=list, description="Key test results or clinical findings explained simply")
    detected_medications: List[DetectedMedication] = Field(default_factory=list, description="List of detected medicines with dosage")
    medication_steps_to_take: List[str] = Field(default_factory=list, description="Step-by-step instructions on how and when to take medications")
    precautions: List[str] = Field(default_factory=list, description="Safety warnings, dietary precautions, and food/drug interactions")
    recommended_next_steps: List[str] = Field(default_factory=list, description="Actionable follow-up guidance for the patient")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)
