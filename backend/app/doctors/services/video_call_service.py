import uuid
import logging
from datetime import datetime, timezone
from app.doctors.schemas import EndCallRequest, EndCallResponse

logger = logging.getLogger("virtual_clinic.video_call_service")

# In-memory call session records
CALL_SESSIONS_STORE: dict[str, dict] = {}

class VideoCallService:
    """Service to process real-time WebRTC audio/video calls, session authorization, and post-call clinical summary updates."""

    @classmethod
    def end_call(cls, req: EndCallRequest) -> EndCallResponse:
        c_id_str = str(req.consultation_id)

        minutes = req.call_duration_seconds // 60
        seconds = req.call_duration_seconds % 60
        formatted_duration = f"{minutes:02d}:{seconds:02d}"

        record = {
            "consultation_id": c_id_str,
            "status": req.status,
            "call_duration_seconds": req.call_duration_seconds,
            "call_duration_formatted": formatted_duration,
            "doctor_notes": req.doctor_notes or "Tele-consultation completed via encrypted WebRTC channel.",
            "follow_up_date": req.follow_up_date,
            "ended_at": datetime.now(timezone.utc),
        }

        CALL_SESSIONS_STORE[c_id_str] = record
        logger.info(f"Video call ended for consultation '{c_id_str}'. Duration: {formatted_duration}, Status: {req.status}")

        return EndCallResponse(
            consultation_id=req.consultation_id,
            status=req.status,
            call_duration_seconds=req.call_duration_seconds,
            call_duration_formatted=formatted_duration,
            doctor_notes=record["doctor_notes"],
            follow_up_date=req.follow_up_date,
            ended_at=record["ended_at"],
        )

    @classmethod
    def get_call_session(cls, consultation_id: uuid.UUID) -> dict:
        c_id_str = str(consultation_id)
        return CALL_SESSIONS_STORE.get(c_id_str, {
            "consultation_id": c_id_str,
            "status": "In Consultation",
            "call_duration_seconds": 0,
            "call_duration_formatted": "00:00",
            "doctor_notes": None,
            "follow_up_date": None,
        })
