import uuid
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.patients.service import PatientService
from app.ai.schemas import PatientSummaryResponse
from app.common.enums import ProcessingStatus

logger = logging.getLogger("virtual_clinic.patient_summary_service")

class PatientSummaryService:
    """
    Synthesizes patient demographics, medical history, allergies, medications, and timeline
    into a structured, provider-independent clinical summary.
    """
    def __init__(self, db: Session):
        self.db = db
        self.patient_service = PatientService(db)

    def generate_patient_summary(self, patient_id: uuid.UUID) -> PatientSummaryResponse:
        # Consume patient information through defined PatientService contract
        patient = self.patient_service.get_patient(patient_id)
        timeline_res = self.patient_service.get_patient_timeline(patient_id)

        # 1. Extracted Facts
        extracted_facts: Dict[str, Any] = {
            "name": patient.name,
            "patient_code": patient.patient_code,
            "age": patient.age,
            "gender": patient.gender,
            "preferred_language": patient.preferred_language,
            "medical_history": patient.medical_history or [],
            "allergies": patient.allergies or [],
            "medications": patient.medications or [],
            "total_encounters": len(timeline_res.timeline) if timeline_res else 0
        }

        # 2. Missing Information Identification
        missing_information: List[str] = []
        if not patient.age:
            missing_information.append("Patient age not recorded")
        if not patient.gender:
            missing_information.append("Gender not recorded")
        if not patient.phone:
            missing_information.append("Contact phone number missing")
        if not patient.medical_history:
            missing_information.append("Past medical conditions history empty")
        if not patient.allergies:
            missing_information.append("Allergies list empty (unconfirmed)")
        if not patient.medications:
            missing_information.append("Current medications list empty")

        # 3. Clinical Summary Narrative
        history_str = ", ".join(patient.medical_history) if patient.medical_history else "None documented"
        allergies_str = ", ".join(patient.allergies) if patient.allergies else "None documented"
        meds_str = ", ".join(patient.medications) if patient.medications else "None documented"

        summary_text = (
            f"Patient {patient.name} ({patient.patient_code}), {patient.age or 'N/A'} years old, {patient.gender or 'N/A'}. "
            f"Documented Conditions: [{history_str}]. Known Allergies: [{allergies_str}]. Active Medications: [{meds_str}]. "
            f"Total recorded clinic encounters: {len(timeline_res.timeline)}."
        )

        return PatientSummaryResponse(
            patient_id=patient.id,
            patient_code=patient.patient_code,
            name=patient.name,
            summary_text=summary_text,
            extracted_facts=extracted_facts,
            missing_information=missing_information,
            status=ProcessingStatus.COMPLETED
        )
