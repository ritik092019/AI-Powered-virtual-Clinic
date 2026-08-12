from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_doctor
from app.users.models import User
from app.doctors.schemas import (
    DoctorNotesCreate,
    DoctorInstructionsCreate,
    ReferralDecisionSchema,
    DoctorAvailabilityUpdate,
    EndCallRequest,
)
from app.doctors.services.remote_consultation_service import RemoteConsultationService
from app.doctors.services.doctor_request_service import DoctorRequestService
from app.common.responses import APIResponse

router = APIRouter(prefix="/doctor-consultations", tags=["Remote Doctor Consultations"])

@router.get("/{consultation_id}")
def get_doctor_consultation_view(
    consultation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve comprehensive consultation view with clear AI intake vs Doctor notes separation."""
    service = RemoteConsultationService(db)
    res = service.get_consultation_view(consultation_id, current_user.id)
    return APIResponse.success(data=res)

@router.post("/{consultation_id}/notes", status_code=status.HTTP_201_CREATED)
def add_doctor_clinical_notes(
    consultation_id: UUID,
    notes_in: DoctorNotesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Author doctor clinical notes, diagnosis, and treatment plan (Doctor / Admin)."""
    service = RemoteConsultationService(db)
    res = service.add_clinical_notes(consultation_id, current_user.id, notes_in)
    return APIResponse.created(data=res, message="Clinical notes added successfully")

@router.post("/{consultation_id}/instructions")
def add_doctor_instructions(
    consultation_id: UUID,
    instructions_in: DoctorInstructionsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Issue professional doctor instructions (Doctor / Admin)."""
    service = RemoteConsultationService(db)
    res = service.add_instructions(consultation_id, current_user.id, instructions_in)
    return APIResponse.success(data=res, message="Doctor instructions updated")

@router.post("/{consultation_id}/referral")
def issue_hospital_referral(
    consultation_id: UUID,
    referral_in: ReferralDecisionSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Issue hospital referral decision (Doctor / Admin)."""
    service = RemoteConsultationService(db)
    res = service.issue_referral(consultation_id, current_user.id, referral_in)
    return APIResponse.success(data=res, message="Hospital referral issued successfully")

@router.get("/{consultation_id}/webrtc")
def get_webrtc_session_metadata(
    consultation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve WebRTC audio/video call room metadata."""
    service = RemoteConsultationService(db)
    res = service.get_webrtc_session(consultation_id)
    return APIResponse.success(data=res)

@router.post("/{consultation_id}/complete")
def complete_doctor_consultation(
    consultation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Mark doctor consultation as completed (Doctor / Admin)."""
    service = RemoteConsultationService(db)
    res = service.complete_consultation(consultation_id, current_user.id)
    return APIResponse.success(data=res, message="Doctor consultation completed")

@router.post("/end-call", status_code=status.HTTP_200_OK)
def end_video_call_session(
    end_call_in: EndCallRequest,
    current_user: User = Depends(get_current_user)
):
    """End real-time WebRTC audio/video call session, save call duration, status, and clinical notes."""
    from app.doctors.services.video_call_service import VideoCallService
    res = VideoCallService.end_call(end_call_in)
    return APIResponse.success(data=res, message="Video consultation call ended successfully")

@router.put("/availability")
def update_doctor_availability(
    avail_in: DoctorAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Update doctor online availability status (Doctor / Admin)."""
    service = DoctorRequestService(db)
    res = service.update_availability(current_user.id, avail_in)
    return APIResponse.success(data=res, message="Availability updated successfully")

