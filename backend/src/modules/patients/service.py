import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from src.modules.patients.repository import PatientRepository
from src.schemas.patient import (
    PatientCreate, 
    PatientUpdate, 
    PatientResponse,
    PatientTimelineEvent,
    PatientTimelineResponse
)
from src.core.exceptions import NotFoundException, ConflictException
from src.core.pagination import create_paginated_response
from src.core.audit import log_audit_event

class PatientService:
    def __init__(self, db: Session):
        self.repo = PatientRepository(db)

    def create_patient(self, patient_in: PatientCreate, performed_by: Optional[uuid.UUID] = None) -> PatientResponse:
        data = patient_in.model_dump()
        if not data.get("patient_code"):
            # Auto-generate PAT-YYYY-XXXXX code
            year = datetime.now(timezone.utc).strftime("%Y")
            random_num = str(uuid.uuid4().int)[:5]
            data["patient_code"] = f"PAT-{year}-{random_num}"
        
        existing = self.repo.get_by_code(data["patient_code"])
        if existing:
            raise ConflictException(f"Patient with code '{data['patient_code']}' already exists")
        
        patient = self.repo.create(data)
        log_audit_event("PATIENT_CREATED", performed_by=performed_by, target_resource="Patient", resource_id=patient.id, details={"patient_code": patient.patient_code})
        return PatientResponse.model_validate(patient)

    def get_patient(self, patient_id: uuid.UUID) -> PatientResponse:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            raise NotFoundException(f"Patient with ID '{patient_id}' not found")
        return PatientResponse.model_validate(patient)

    def update_patient(self, patient_id: uuid.UUID, update_in: PatientUpdate, performed_by: Optional[uuid.UUID] = None) -> PatientResponse:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            raise NotFoundException(f"Patient with ID '{patient_id}' not found")
        
        update_data = update_in.model_dump(exclude_unset=True)
        updated_patient = self.repo.update(patient, update_data)
        log_audit_event("PATIENT_UPDATED", performed_by=performed_by, target_resource="Patient", resource_id=patient.id)
        return PatientResponse.model_validate(updated_patient)

    def list_patients(
        self, 
        page: int = 1, 
        limit: int = 10, 
        search: Optional[str] = None,
        gender: Optional[str] = None,
        preferred_language: Optional[str] = None,
        age_min: Optional[int] = None,
        age_max: Optional[int] = None
    ) -> Dict[str, Any]:
        skip = (page - 1) * limit
        patients, total = self.repo.list_paginated(
            skip=skip, 
            limit=limit, 
            search=search,
            gender=gender,
            preferred_language=preferred_language,
            age_min=age_min,
            age_max=age_max
        )
        patient_responses = [PatientResponse.model_validate(p) for p in patients]
        return create_paginated_response(patient_responses, total, page, limit)

    def get_patient_timeline(self, patient_id: uuid.UUID) -> PatientTimelineResponse:
        patient = self.repo.get_by_id(patient_id)
        if not patient:
            raise NotFoundException(f"Patient with ID '{patient_id}' not found")

        events: List[PatientTimelineEvent] = []

        # 1. Registration event
        events.append(PatientTimelineEvent(
            id=f"evt_reg_{patient.id}",
            event_type="PATIENT_REGISTERED",
            title="Patient Registered",
            description=f"Patient {patient.name} ({patient.patient_code}) registered in Virtual Clinic system.",
            timestamp=patient.created_at,
            metadata={"patient_code": patient.patient_code, "language": patient.preferred_language}
        ))

        # 2. Medical History / Allergy updates event
        if patient.medical_history or patient.allergies:
            events.append(PatientTimelineEvent(
                id=f"evt_medhist_{patient.id}",
                event_type="MEDICAL_HISTORY_RECORDED",
                title="Medical History & Allergies Recorded",
                description=f"Medical Conditions: {', '.join(patient.medical_history) if patient.medical_history else 'None'}. Allergies: {', '.join(patient.allergies) if patient.allergies else 'None'}.",
                timestamp=patient.updated_at,
                metadata={"medical_history": patient.medical_history, "allergies": patient.allergies, "medications": patient.medications}
            ))

        # 3. Consultation events
        consultations = self.repo.get_patient_consultation_events(patient_id)
        for c in consultations:
            events.append(PatientTimelineEvent(
                id=f"evt_consult_{c.id}",
                event_type="CONSULTATION_RECORDED",
                title=f"Consultation ({c.status.value})",
                description=c.chief_complaint or "Intake consultation recorded.",
                timestamp=c.created_at,
                metadata={"consultation_id": str(c.id), "status": c.status.value}
            ))

        # Sort timeline events chronologically descending
        events.sort(key=lambda x: x.timestamp, reverse=True)

        return PatientTimelineResponse(
            patient_id=patient.id,
            patient_code=patient.patient_code,
            name=patient.name,
            timeline=events
        )
