from datetime import datetime, timezone
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from src.core.websocket import manager

async def broadcast_sos_alert(payload: dict):
    try:
        await manager.broadcast(payload)
    except Exception as e:
        pass
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.audit import log_audit_event
from src.core.response import APIResponse
from src.schemas.emergency import SOSCreate, SOSResponse
from database.models import User, Notification, NotificationType, UserRole

router = APIRouter(prefix="/emergency", tags=["Emergency SOS"])

@router.post("/sos", status_code=status.HTTP_201_CREATED)
def trigger_emergency_sos(
    sos_in: SOSCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger an Emergency SOS event for the authenticated patient.
    Logs structured audit entry, sends high-priority notification to assigned staff, and returns confirmation.
    """
    now = datetime.now(timezone.utc)
    sos_id = f"sos_{uuid.uuid4().hex[:8]}"

    location_info = sos_in.location_address or (
        f"GPS Coordinates: {sos_in.latitude}, {sos_in.longitude}" if sos_in.latitude and sos_in.longitude else "Location not shared"
    )

    # 1. Log structured audit event
    log_audit_event(
        action=f"EMERGENCY_SOS_{sos_in.action}",
        performed_by=current_user.id,
        target_resource="PatientSOS",
        details={
            "sos_id": sos_id,
            "patient_name": current_user.name,
            "action": sos_in.action,
            "location": location_info,
            "contact_number": sos_in.contact_number,
        }
    )

    # 2. Dispatch High-Priority Notification DB Records to Health Workers & Doctors
    staff_users = db.query(User).filter(User.role.in_([UserRole.HEALTH_WORKER, UserRole.DOCTOR, UserRole.ADMIN])).all()
    for staff in staff_users:
        notif = Notification(
            id=uuid.uuid4(),
            user_id=staff.id,
            title=f"CRITICAL EMERGENCY SOS: {current_user.name}",
            message=f"Patient {current_user.name} triggered SOS ({sos_in.action}). Location: {location_info}. Phone: {sos_in.contact_number or current_user.phone or '108'}.",
            type=NotificationType.WARNING,
            is_read=False,
            related_entity_id=current_user.id,
        )
        db.add(notif)
    
    db.commit()

    # 3. Broadcast Real-Time HIGH ALERT over WebSocket to all active Doctor & Staff connections
    background_tasks.add_task(broadcast_sos_alert, {
        "event": "INCOMING_CALL",
        "type": "INCOMING_CALL",
        "call_id": sos_id,
        "consultation_id": f"EMERGENCY-{sos_id[:8]}",
        "patient_id": str(current_user.id),
        "patient_name": f"CRITICAL SOS: {current_user.name}",
        "call_type": "emergency_sos",
        "location": location_info,
        "contact_number": sos_in.contact_number or "108",
        "timestamp": now.isoformat()
    })

    sos_resp = SOSResponse(
        sos_id=sos_id,
        patient_id=str(current_user.id),
        action=sos_in.action,
        status="TRIGGERED",
        location_shared=bool(sos_in.latitude or sos_in.location_address),
        location_address=location_info,
        timestamp=now,
        message=f"Emergency SOS alert ({sos_in.action}) recorded successfully. Relevant health worker & emergency services alerted."
    )

    data = sos_resp.model_dump()
    data["timestamp"] = now.isoformat()

    return APIResponse.created(data=data, message="Emergency SOS triggered successfully")

@router.get("/sos/my-events")
def get_my_sos_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve past emergency SOS alerts triggered by current patient."""
    notifications = db.query(Notification).filter(
        Notification.related_entity_id == current_user.id,
        Notification.type == NotificationType.WARNING
    ).order_by(Notification.created_at.desc()).all()

    events = [
        {
            "id": str(n.id),
            "title": n.title,
            "message": n.message,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifications
    ]
    return APIResponse.success(data=events)
