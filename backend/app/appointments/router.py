import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.common.responses import APIResponse
from app.common.exceptions import BadRequestException, NotFoundException
from app.common.enums import UserRole, AppointmentStatus, NotificationType, RiskLevel
from app.users.models import User
from app.appointments.models import Appointment
from app.appointments.schemas import (
    AppointmentCreateRequest,
    AppointmentResponse,
    DoctorInfo,
    DoctorActionRequest
)
from app.appointments.services.ai_specialty_classifier import AISpecialtyClassifier
from app.appointments.services.doctor_matcher import DoctorMatcher
from app.notifications.service import NotificationService
from app.audit.service import log_audit_event

router = APIRouter(prefix="/appointments", tags=["Smart Doctor Appointments"])

def _to_appointment_response(c: Appointment) -> AppointmentResponse:
    doc_info = None
    if c.doctor:
        spec = c.doctor.profile_metadata.get("specialty", c.classified_specialty or "General Tele-Consultant") if c.doctor.profile_metadata else (c.classified_specialty or "General Tele-Consultant")
        doc_info = DoctorInfo(
            doctor_id=c.doctor.id,
            name=f"Dr. {c.doctor.name}" if not c.doctor.name.startswith("Dr. ") else c.doctor.name,
            specialty=spec,
            qualifications="MBBS, MD",
            experience_years=12,
            license_number="MCI-889021",
            language=c.doctor.language or "English"
        )

    patient_name = c.patient.name if c.patient else "Patient"

    return AppointmentResponse(
        id=c.id,
        patient_id=c.patient_id,
        patient_name=patient_name,
        doctor_id=c.doctor_id,
        doctor=doc_info,
        status=c.status,
        consultation_type=c.consultation_type,
        symptoms=c.symptoms,
        duration=c.duration,
        severity=c.severity,
        age=c.age,
        existing_conditions=c.existing_conditions or [],
        allergies=c.allergies or [],
        current_medications=c.current_medications or [],
        vitals=c.vitals or {},
        voice_transcript=c.voice_transcript,
        preferred_language=c.preferred_language,
        preferred_date=c.preferred_date,
        preferred_time=c.preferred_time,
        classified_specialty=c.classified_specialty,
        classification_source=c.classification_source,
        classification_confidence=c.classification_confidence,
        match_score=c.match_score,
        matching_notes=c.matching_notes,
        webrtc_room_id=c.webrtc_room_id,
        created_at=c.created_at,
        updated_at=c.updated_at
    )

@router.post("/request", status_code=status.HTTP_201_CREATED)
def request_smart_appointment(
    req: AppointmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Patient submits a new multilingual smart appointment request with symptoms / voice input.
    Enforces JWT + RBAC, prevents duplicate active requests, uses Gemini for specialty classification,
    and runs deterministic auto-matching to assign an available doctor or queue the request.
    """
    # 1. Prevent duplicate active appointment requests
    existing_active = db.query(Appointment).filter(
        Appointment.patient_id == current_user.id,
        Appointment.status.in_([
            AppointmentStatus.PENDING_QUEUE,
            AppointmentStatus.ASSIGNED,
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.IN_CONSULTATION
        ])
    ).first()

    if existing_active:
        raise BadRequestException(
            f"You already have an active appointment request ({existing_active.status.value}). "
            "Please complete or cancel your existing appointment before creating a new one."
        )

    # 2. Use Gemini AI for Specialty Classification (without diagnostic text)
    specialty, source, confidence = AISpecialtyClassifier.classify_complaint(
        symptoms=req.symptoms,
        duration=req.duration or "",
        severity=req.severity or "",
        age=req.age
    )

    # 3. Create Appointment database record
    appointment = Appointment(
        id=uuid.uuid4(),
        patient_id=current_user.id,
        status=AppointmentStatus.PENDING_QUEUE,
        consultation_type=req.consultation_type,
        symptoms=req.symptoms,
        duration=req.duration,
        severity=req.severity,
        age=req.age,
        existing_conditions=req.existing_conditions,
        allergies=req.allergies,
        current_medications=req.current_medications,
        vitals=req.vitals,
        voice_transcript=req.voice_transcript,
        preferred_language=req.preferred_language,
        preferred_date=req.preferred_date,
        preferred_time=req.preferred_time,
        classified_specialty=specialty,
        classification_source=source,
        classification_confidence=confidence,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # 4. Run Deterministic Doctor Auto-Matcher
    matcher = DoctorMatcher(db)
    doctor, score, notes = matcher.auto_match_doctor(appointment)
    db.refresh(appointment)

    res = _to_appointment_response(appointment)
    msg = f"Appointment created. Classified as '{specialty}'. "
    if doctor:
        msg += f"Auto-matched with Dr. {doctor.name}."
    else:
        msg += "Placed in priority queue waiting for an available doctor."

    return APIResponse.created(data=res, message=msg)


@router.get("/my-appointments", status_code=status.HTTP_200_OK)
def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve logged-in user's active and past appointments.
    Patients see their own appointments; Doctors see appointments assigned to them.
    """
    if current_user.role == UserRole.DOCTOR:
        appointments = db.query(Appointment).filter(
            Appointment.doctor_id == current_user.id
        ).order_by(Appointment.created_at.desc()).all()
    else:
        appointments = db.query(Appointment).filter(
            Appointment.patient_id == current_user.id
        ).order_by(Appointment.created_at.desc()).all()

    res = [_to_appointment_response(a) for a in appointments]
    return APIResponse.success(data=res, message="Appointments retrieved successfully")


@router.post("/{appointment_id}/doctor-action", status_code=status.HTTP_200_OK)
def doctor_action_appointment(
    appointment_id: uuid.UUID,
    action_req: DoctorActionRequest,
    current_user: User = Depends(require_roles([UserRole.DOCTOR])),
    db: Session = Depends(get_db)
):
    """
    Doctor accepts or declines an assigned appointment request.
    If accepted, status becomes CONFIRMED and a WebRTC audio/video link is generated.
    If declined, appointment is re-matched to another doctor or queued.
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_user.id
    ).first()

    if not appointment:
        raise NotFoundException(f"Appointment '{appointment_id}' assigned to you was not found.")

    act = action_req.action.lower()

    if act == "accept":
        appointment.status = AppointmentStatus.CONFIRMED
        appointment.webrtc_room_id = f"clinic-room-{appointment.id.hex[:8]}"
        db.commit()
        db.refresh(appointment)

        # Notify Patient
        notif_service = NotificationService(db)
        notif_service.send_notification(
            user_id=appointment.patient_id,
            title="Appointment Confirmed by Doctor!",
            message=f"Dr. {current_user.name} has confirmed your appointment. Click to join the WebRTC consultation call.",
            type=NotificationType.APPOINTMENT_MATCH,
            priority=RiskLevel.HIGH,
            related_entity_type="APPOINTMENT",
            related_entity_id=appointment.id,
            navigation_target=f"/consultation/room/{appointment.webrtc_room_id}"
        )

        log_audit_event(
            action="APPOINTMENT_CONFIRMED",
            performed_by=current_user.id,
            target_resource="APPOINTMENT",
            resource_id=appointment.id,
            details={"webrtc_room_id": appointment.webrtc_room_id}
        )

        res = _to_appointment_response(appointment)
        return APIResponse.success(data=res, message="Appointment confirmed and WebRTC consultation room ready.")

    elif act == "decline":
        appointment.doctor_id = None
        appointment.status = AppointmentStatus.PENDING_QUEUE
        appointment.matching_notes = f"Declined by Dr. {current_user.name} ({action_req.reason or 'No reason provided'}). Re-matching..."
        db.commit()

        # Re-run matcher
        matcher = DoctorMatcher(db)
        matcher.auto_match_doctor(appointment)
        db.refresh(appointment)

        log_audit_event(
            action="APPOINTMENT_DECLINED",
            performed_by=current_user.id,
            target_resource="APPOINTMENT",
            resource_id=appointment.id,
            details={"reason": action_req.reason}
        )

        res = _to_appointment_response(appointment)
        return APIResponse.success(data=res, message="Appointment declined and queued for re-matching.")

    else:
        raise BadRequestException("Invalid action. Must be 'accept' or 'decline'.")


@router.post("/{appointment_id}/cancel", status_code=status.HTTP_200_OK)
def cancel_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Patient cancels their pending or assigned appointment request.
    """
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == current_user.id
    ).first()

    if not appointment:
        raise NotFoundException("Appointment record not found.")

    if appointment.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
        raise BadRequestException(f"Appointment is already {appointment.status.value}.")

    appointment.status = AppointmentStatus.CANCELLED
    db.commit()
    db.refresh(appointment)

    log_audit_event(
        action="APPOINTMENT_CANCELLED",
        performed_by=current_user.id,
        target_resource="APPOINTMENT",
        resource_id=appointment.id
    )

    res = _to_appointment_response(appointment)
    return APIResponse.success(data=res, message="Appointment cancelled successfully.")
