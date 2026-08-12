import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from src.modules.consultations.repository import ConsultationRepository
from src.schemas.consultation import (
    ConsultationCreate, 
    ConsultationUpdate, 
    ConsultationResponse,
    ReviewBeforeSubmissionSchema,
    SymptomValidationRequest,
    SymptomValidationResponse,
    VitalsValidationRequest,
    VitalsValidationResponse,
    StandardizedConsultationPayload,
    Symptom,
    VitalSigns
)
from database.models.enums import ConsultationStatus
from src.core.exceptions import NotFoundException, BadRequestException
from src.core.pagination import create_paginated_response
from src.core.audit import log_audit_event

VALID_STATUS_TRANSITIONS = {
    ConsultationStatus.DRAFT: [ConsultationStatus.PROCESSING, ConsultationStatus.AI_REVIEW_READY, ConsultationStatus.AWAITING_DOCTOR],
    ConsultationStatus.PROCESSING: [ConsultationStatus.AI_REVIEW_READY, ConsultationStatus.AWAITING_DOCTOR, ConsultationStatus.DRAFT],
    ConsultationStatus.AI_REVIEW_READY: [ConsultationStatus.AWAITING_DOCTOR, ConsultationStatus.DOCTOR_ACCEPTED, ConsultationStatus.IN_CONSULTATION],
    ConsultationStatus.AWAITING_DOCTOR: [ConsultationStatus.DOCTOR_ACCEPTED, ConsultationStatus.IN_CONSULTATION, ConsultationStatus.REFERRED],
    ConsultationStatus.DOCTOR_ACCEPTED: [ConsultationStatus.IN_CONSULTATION, ConsultationStatus.REFERRED, ConsultationStatus.COMPLETED],
    ConsultationStatus.IN_CONSULTATION: [ConsultationStatus.REFERRED, ConsultationStatus.COMPLETED],
    ConsultationStatus.REFERRED: [ConsultationStatus.COMPLETED],
    ConsultationStatus.COMPLETED: []
}

class ConsultationService:
    def __init__(self, db: Session):
        self.repo = ConsultationRepository(db)

    def create_consultation(self, consultation_in: ConsultationCreate, default_hw_id: uuid.UUID) -> ConsultationResponse:
        data = consultation_in.model_dump()
        if not data.get("health_worker_id"):
            data["health_worker_id"] = default_hw_id
        
        data["symptoms"] = [s.model_dump() if hasattr(s, "model_dump") else s for s in data.get("symptoms", [])]
        data["vitals"] = data.get("vitals").model_dump() if hasattr(data.get("vitals"), "model_dump") else data.get("vitals", {})
        data["documents"] = [d.model_dump() if hasattr(d, "model_dump") else d for d in data.get("documents", [])]
        data["images"] = [img.model_dump() if hasattr(img, "model_dump") else img for img in data.get("images", [])]
        data["status"] = ConsultationStatus.DRAFT

        consultation = self.repo.create(data)
        log_audit_event("CONSULTATION_DRAFT_CREATED", performed_by=consultation.health_worker_id, resource_id=consultation.id)
        return ConsultationResponse.model_validate(consultation)

    def get_consultation(self, consultation_id: uuid.UUID) -> ConsultationResponse:
        consultation = self.repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundException(f"Consultation with ID '{consultation_id}' not found")
        return ConsultationResponse.model_validate(consultation)

    def update_consultation(self, consultation_id: uuid.UUID, update_in: ConsultationUpdate, performed_by: Optional[uuid.UUID] = None) -> ConsultationResponse:
        consultation = self.repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundException(f"Consultation with ID '{consultation_id}' not found")
        
        update_data = update_in.model_dump(exclude_unset=True)
        if "symptoms" in update_data and update_data["symptoms"] is not None:
            update_data["symptoms"] = [s.model_dump() if hasattr(s, "model_dump") else s for s in update_data["symptoms"]]
        if "vitals" in update_data and update_data["vitals"] is not None:
            update_data["vitals"] = update_data["vitals"].model_dump() if hasattr(update_data["vitals"], "model_dump") else update_data["vitals"]
        if "documents" in update_data and update_data["documents"] is not None:
            update_data["documents"] = [d.model_dump() if hasattr(d, "model_dump") else d for d in update_data["documents"]]
        if "images" in update_data and update_data["images"] is not None:
            update_data["images"] = [img.model_dump() if hasattr(img, "model_dump") else img for img in update_data["images"]]

        updated = self.repo.update(consultation, update_data)
        log_audit_event("CONSULTATION_UPDATED", performed_by=performed_by, resource_id=consultation.id)
        return ConsultationResponse.model_validate(updated)

    def submit_consultation_review(self, consultation_id: uuid.UUID, review_in: ReviewBeforeSubmissionSchema, performed_by: Optional[uuid.UUID] = None) -> ConsultationResponse:
        """
        Review-before-submission workflow: verifies intake and moves status from DRAFT to AI_REVIEW_READY.
        """
        consultation = self.repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundException(f"Consultation with ID '{consultation_id}' not found")
        
        if consultation.status != ConsultationStatus.DRAFT:
            raise BadRequestException(f"Consultation is in '{consultation.status.value}' status and cannot be submitted. Must be in DRAFT status.")

        # Update status to AI_REVIEW_READY
        updated = self.repo.update_status(consultation, ConsultationStatus.AI_REVIEW_READY)
        log_audit_event("CONSULTATION_SUBMITTED_FOR_REVIEW", performed_by=performed_by, resource_id=consultation.id)
        return ConsultationResponse.model_validate(updated)

    def update_status(self, consultation_id: uuid.UUID, new_status: ConsultationStatus, performed_by: Optional[uuid.UUID] = None) -> ConsultationResponse:
        consultation = self.repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundException(f"Consultation with ID '{consultation_id}' not found")

        current_status = consultation.status
        if new_status != current_status and new_status not in VALID_STATUS_TRANSITIONS.get(current_status, []):
            raise BadRequestException(
                f"Invalid status transition from '{current_status.value}' to '{new_status.value}'. "
                f"Allowed next statuses: {[s.value for s in VALID_STATUS_TRANSITIONS.get(current_status, [])]}"
            )

        updated = self.repo.update_status(consultation, new_status)
        log_audit_event("CONSULTATION_STATUS_CHANGED", performed_by=performed_by, resource_id=consultation.id, details={"from": current_status.value, "to": new_status.value})
        return ConsultationResponse.model_validate(updated)

    def list_consultations(
        self,
        page: int = 1,
        limit: int = 10,
        patient_id: Optional[uuid.UUID] = None,
        health_worker_id: Optional[uuid.UUID] = None,
        doctor_id: Optional[uuid.UUID] = None,
        status: Optional[ConsultationStatus] = None
    ) -> Dict[str, Any]:
        skip = (page - 1) * limit
        items, total = self.repo.list_paginated(
            skip=skip, 
            limit=limit, 
            patient_id=patient_id, 
            health_worker_id=health_worker_id, 
            doctor_id=doctor_id, 
            status=status
        )
        responses = [ConsultationResponse.model_validate(c) for c in items]
        return create_paginated_response(responses, total, page, limit)

    def get_standardized_payload(self, consultation_id: uuid.UUID) -> StandardizedConsultationPayload:
        """
        Returns structured standardized consultation payload formatted specifically for consumption
        by future AI Triage / Risk Engine services without exposing ORM internals.
        """
        consultation = self.repo.get_by_id(consultation_id)
        if not consultation:
            raise NotFoundException(f"Consultation with ID '{consultation_id}' not found")

        symptoms_list = [Symptom(**s) for s in (consultation.symptoms or [])]
        vitals_dict = VitalSigns(**(consultation.vitals or {}))

        return StandardizedConsultationPayload(
            consultation_id=consultation.id,
            patient_id=consultation.patient_id,
            status=consultation.status,
            chief_complaint=consultation.chief_complaint,
            symptoms=symptoms_list,
            vitals=vitals_dict,
            voice_transcript=consultation.voice_transcript,
            medical_documents_count=len(consultation.documents or []),
            patient_images_count=len(consultation.images or []),
            created_at=consultation.created_at
        )

    @staticmethod
    def validate_symptoms(req: SymptomValidationRequest) -> SymptomValidationResponse:
        errors = []
        for idx, s in enumerate(req.symptoms):
            if not s.name or not s.name.strip():
                errors.append(f"Symptom #{idx+1}: Name cannot be empty")
            if s.severity < 1 or s.severity > 10:
                errors.append(f"Symptom '{s.name}': Severity must be between 1 and 10")
            if not s.duration or not s.duration.strip():
                errors.append(f"Symptom '{s.name}': Duration cannot be empty")
        
        return SymptomValidationResponse(
            valid=len(errors) == 0,
            errors=errors,
            symptoms=req.symptoms
        )

    @staticmethod
    def validate_vitals(req: VitalsValidationRequest) -> VitalsValidationResponse:
        warnings = []
        errors = []
        v = req.vitals

        if v.temperature:
            if v.temperature.value > 100.4:
                warnings.append(f"Fever detected: Temperature {v.temperature.value} {v.temperature.unit}")
            if v.temperature.value < 90.0 or v.temperature.value > 110.0:
                errors.append(f"Out-of-bound temperature value: {v.temperature.value}")

        if v.spo2:
            if v.spo2.value < 95.0:
                warnings.append(f"Hypoxia alert: SpO2 level {v.spo2.value}% is below normal (>=95%)")
            if v.spo2.value < 50.0 or v.spo2.value > 100.0:
                errors.append(f"Out-of-bound SpO2 percentage: {v.spo2.value}%")

        if v.blood_pressure:
            if v.blood_pressure.systolic > 140 or v.blood_pressure.diastolic > 90:
                warnings.append(f"Elevated Blood Pressure: {v.blood_pressure.systolic}/{v.blood_pressure.diastolic} mmHg")

        return VitalsValidationResponse(
            valid=len(errors) == 0,
            warnings=warnings,
            errors=errors,
            vitals=v
        )
