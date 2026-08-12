import uuid
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.doctors.repository import DoctorRepository
from app.doctors.schemas import (
    DoctorNotesCreate,
    DoctorNotesResponse,
    DoctorInstructionsCreate,
    ReferralDecisionSchema,
    WebRTCSessionSchema,
    DoctorConsultationResponse
)
from app.common.enums import DoctorRequestStatus, ConsultationStatus
from app.common.exceptions import NotFoundException, BadRequestException
from app.ai.services.llm_service import LLMService
from app.audit.service import AuditService

logger = logging.getLogger("virtual_clinic.remote_consultation_service")

class RemoteConsultationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DoctorRepository(db)
        self.audit_service = AuditService(db)

    def get_consultation_view(self, consultation_id: uuid.UUID, current_user_id: uuid.UUID) -> DoctorConsultationResponse:
        req = self.repo.get_doctor_request_by_consultation(consultation_id)
        if not req:
            raise NotFoundException(f"No doctor request associated with consultation ID '{consultation_id}'.")

        # 1. Non-binding AI preliminary assessment
        ai_assessment = LLMService.generate_assessment({"consultation_id": consultation_id})

        # 2. Authoritative Doctor Clinical Notes
        note = self.repo.get_clinical_notes_by_consultation(consultation_id)
        doctor_notes_res = DoctorNotesResponse.model_validate(note) if note else None

        # 3. WebRTC metadata contract
        webrtc_session = WebRTCSessionSchema(
            room_id=f"room_{consultation_id.hex[:12]}",
            consultation_id=consultation_id,
            status="CONNECTED" if req.status == DoctorRequestStatus.IN_CONSULTATION else "WAITING_FOR_PEER"
        )

        self.audit_service.log_event(
            user_id=current_user_id,
            action="DOCTOR_CONSULTATION_VIEWED",
            resource_type="DOCTOR_CONSULTATION",
            resource_id=consultation_id
        )

        return DoctorConsultationResponse(
            consultation_id=consultation_id,
            patient_id=req.patient_id,
            request_id=req.id,
            status=req.status,
            doctor_id=req.doctor_id,
            ai_preliminary_assessment=ai_assessment.model_dump(mode="json"),
            doctor_clinical_notes=doctor_notes_res,
            doctor_instructions=req.instructions,
            referral_decision=req.referral,
            webrtc_session=webrtc_session,
            updated_at=req.updated_at
        )

    def add_clinical_notes(
        self,
        consultation_id: uuid.UUID,
        doctor_id: uuid.UUID,
        notes_in: DoctorNotesCreate
    ) -> DoctorNotesResponse:
        req = self.repo.get_doctor_request_by_consultation(consultation_id)
        if not req:
            raise NotFoundException(f"No active doctor request found for consultation '{consultation_id}'.")

        note = self.repo.save_clinical_notes(
            consultation_id=consultation_id,
            doctor_id=doctor_id,
            observations=notes_in.clinical_observations,
            diagnosis=notes_in.diagnosis,
            treatment_plan=notes_in.treatment_plan,
            prescriptions=notes_in.prescriptions,
            follow_up_days=notes_in.follow_up_days
        )

        # Move status to IN_CONSULTATION
        self.repo.update_doctor_request_status(req.id, DoctorRequestStatus.IN_CONSULTATION)

        self.audit_service.log_event(
            user_id=doctor_id,
            action="DOCTOR_NOTES_ADDED",
            resource_type="DOCTOR_NOTES",
            resource_id=note.id,
            details={"diagnosis": notes_in.diagnosis}
        )
        logger.info(f"Doctor '{doctor_id}' authored clinical notes for consultation '{consultation_id}'.")
        return DoctorNotesResponse.model_validate(note)

    def add_instructions(
        self,
        consultation_id: uuid.UUID,
        doctor_id: uuid.UUID,
        instructions_in: DoctorInstructionsCreate
    ) -> DoctorConsultationResponse:
        req = self.repo.get_doctor_request_by_consultation(consultation_id)
        if not req:
            raise NotFoundException(f"No active doctor request found for consultation '{consultation_id}'.")

        self.repo.save_instructions(req.id, instructions_in.instructions)

        self.audit_service.log_event(
            user_id=doctor_id,
            action="DOCTOR_INSTRUCTIONS_PROVIDED",
            resource_type="DOCTOR_INSTRUCTIONS",
            resource_id=req.id
        )
        return self.get_consultation_view(consultation_id, doctor_id)

    def issue_referral(
        self,
        consultation_id: uuid.UUID,
        doctor_id: uuid.UUID,
        referral_in: ReferralDecisionSchema
    ) -> DoctorConsultationResponse:
        req = self.repo.get_doctor_request_by_consultation(consultation_id)
        if not req:
            raise NotFoundException(f"No active doctor request found for consultation '{consultation_id}'.")

        referral_data = referral_in.model_dump()
        self.repo.save_referral(req.id, referral_data)

        self.audit_service.log_event(
            user_id=doctor_id,
            action="DOCTOR_REFERRAL_MADE",
            resource_type="DOCTOR_REFERRAL",
            resource_id=req.id,
            details={"destination": referral_in.destination_facility, "urgency": referral_in.transfer_urgency}
        )
        logger.info(f"Doctor '{doctor_id}' issued hospital referral to '{referral_in.destination_facility}'.")
        return self.get_consultation_view(consultation_id, doctor_id)

    def get_webrtc_session(self, consultation_id: uuid.UUID) -> WebRTCSessionSchema:
        return WebRTCSessionSchema(
            room_id=f"room_{consultation_id.hex[:12]}",
            consultation_id=consultation_id,
            status="CONNECTED"
        )

    def complete_consultation(self, consultation_id: uuid.UUID, doctor_id: uuid.UUID) -> DoctorConsultationResponse:
        req = self.repo.get_doctor_request_by_consultation(consultation_id)
        if not req:
            raise NotFoundException(f"No active doctor request found for consultation '{consultation_id}'.")

        self.repo.update_doctor_request_status(req.id, DoctorRequestStatus.COMPLETED)

        self.audit_service.log_event(
            user_id=doctor_id,
            action="DOCTOR_CONSULTATION_COMPLETED",
            resource_type="DOCTOR_CONSULTATION",
            resource_id=consultation_id
        )
        logger.info(f"Doctor '{doctor_id}' completed consultation '{consultation_id}'.")
        return self.get_consultation_view(consultation_id, doctor_id)
