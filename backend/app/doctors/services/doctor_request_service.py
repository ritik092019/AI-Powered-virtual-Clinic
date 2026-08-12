import uuid
import logging
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.doctors.repository import DoctorRepository
from app.doctors.schemas import (
    DoctorRequestCreate,
    DoctorRequestResponse,
    DoctorQueueFilter,
    DoctorQueueItem,
    DoctorAvailabilityUpdate,
    DoctorAvailabilityResponse
)
from app.common.enums import DoctorRequestStatus, DoctorAvailabilityStatus, NotificationType
from app.common.exceptions import NotFoundException, BadRequestException
from app.audit.service import AuditService
from app.notifications.service import NotificationService

logger = logging.getLogger("virtual_clinic.doctor_request_service")

class DoctorRequestService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DoctorRepository(db)
        self.audit_service = AuditService(db)
        self.notification_service = NotificationService(db)

    def create_request(self, req_in: DoctorRequestCreate, current_user_id: uuid.UUID) -> DoctorRequestResponse:
        req = self.repo.create_doctor_request(
            consultation_id=req_in.consultation_id,
            patient_id=req_in.patient_id,
            requested_by=current_user_id,
            priority=req_in.priority,
            reason=req_in.reason,
            risk_assessment_id=req_in.risk_assessment_id
        )

        self.audit_service.log_event(
            user_id=current_user_id,
            action="DOCTOR_REQUEST_CREATED",
            resource_type="DOCTOR_REQUEST",
            resource_id=req.id,
            details={"priority": req.priority, "reason": req.reason}
        )

        self.notification_service.send_notification(
            user_id=current_user_id,
            title=f"Doctor Consultation Request ({req.priority})",
            message=f"Escalation request submitted: {req.reason}",
            type=NotificationType.DOCTOR_REQUEST,
            priority=req.priority,
            event_type="doctor_request_created",
            related_entity_type="DOCTOR_REQUEST",
            related_entity_id=req.id,
            navigation_target=f"/doctor-queue/{req.id}"
        )

        logger.info(f"Doctor request '{req.id}' created with priority '{req.priority}'.")
        return DoctorRequestResponse.model_validate(req)

    def get_request(self, request_id: uuid.UUID, current_user_id: uuid.UUID) -> DoctorRequestResponse:
        req = self.repo.get_doctor_request(request_id)
        if not req:
            raise NotFoundException(f"Doctor request with ID '{request_id}' not found.")

        self.audit_service.log_event(
            user_id=current_user_id,
            action="DOCTOR_REQUEST_VIEWED",
            resource_type="DOCTOR_REQUEST",
            resource_id=req.id
        )
        return DoctorRequestResponse.model_validate(req)

    def get_queue(self, filter_in: DoctorQueueFilter, current_user_id: uuid.UUID) -> List[DoctorQueueItem]:
        requests = self.repo.list_doctor_queue(
            priority=filter_in.priority,
            status=filter_in.status,
            unassigned_only=filter_in.unassigned_only
        )

        now = datetime.now(timezone.utc)
        items: List[DoctorQueueItem] = []
        for r in requests:
            created = r.created_at if r.created_at.tzinfo else r.created_at.replace(tzinfo=timezone.utc)
            wait_time = round((now - created).total_seconds() / 60.0, 1)
            items.append(
                DoctorQueueItem(
                    request_id=r.id,
                    consultation_id=r.consultation_id,
                    patient_id=r.patient_id,
                    patient_name="Intake Patient",
                    patient_code="PAT-2026",
                    priority=r.priority,
                    status=r.status,
                    reason=r.reason,
                    doctor_id=r.doctor_id,
                    requested_by=r.requested_by,
                    wait_time_minutes=wait_time,
                    created_at=r.created_at
                )
            )

        self.audit_service.log_event(
            user_id=current_user_id,
            action="DOCTOR_QUEUE_VIEWED",
            resource_type="DOCTOR_QUEUE",
            details={"count": len(items)}
        )
        return items

    def accept_request(self, request_id: uuid.UUID, doctor_id: uuid.UUID) -> DoctorRequestResponse:
        req = self.repo.get_doctor_request(request_id)
        if not req:
            raise NotFoundException(f"Doctor request '{request_id}' not found.")

        if req.status not in (DoctorRequestStatus.REQUESTED, DoctorRequestStatus.ACCEPTED):
            raise BadRequestException(f"Cannot accept request in '{req.status}' state.")

        accepted = self.repo.accept_doctor_request(request_id, doctor_id)

        self.audit_service.log_event(
            user_id=doctor_id,
            action="DOCTOR_REQUEST_ACCEPTED",
            resource_type="DOCTOR_REQUEST",
            resource_id=request_id
        )

        self.notification_service.send_notification(
            user_id=req.requested_by,
            title="Doctor Consultation Accepted",
            message="An attending physician has accepted and claimed your patient escalation request.",
            type=NotificationType.DOCTOR_REQUEST,
            priority=req.priority,
            event_type="doctor_request_accepted",
            related_entity_type="DOCTOR_REQUEST",
            related_entity_id=req.id,
            navigation_target=f"/consultations/{req.consultation_id}"
        )

        logger.info(f"Doctor request '{request_id}' claimed/accepted by Doctor '{doctor_id}'.")
        return DoctorRequestResponse.model_validate(accepted)

    def update_availability(self, doctor_id: uuid.UUID, avail_in: DoctorAvailabilityUpdate) -> DoctorAvailabilityResponse:
        avail = self.repo.set_doctor_availability(
            user_id=doctor_id,
            status=avail_in.status,
            specialty=avail_in.specialty
        )
        self.audit_service.log_event(
            user_id=doctor_id,
            action="DOCTOR_AVAILABILITY_UPDATED",
            resource_type="DOCTOR_AVAILABILITY",
            details={"status": avail_in.status}
        )
        return DoctorAvailabilityResponse.model_validate(avail)
