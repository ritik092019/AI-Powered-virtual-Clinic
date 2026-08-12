from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas.notification import NotificationCreate
from src.modules.notifications.service import NotificationService
from src.core.response import APIResponse

router = APIRouter(prefix="/notifications", tags=["Notifications Feed"])

@router.get("")
def list_notifications(
    user_id: UUID = Query(..., description="User UUID to fetch notifications for"),
    unread_only: bool = Query(False, description="Filter only unread notifications"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List paginated notifications for a specified user."""
    service = NotificationService(db)
    result = service.list_user_notifications(user_id=user_id, unread_only=unread_only, page=page, limit=limit)
    return APIResponse.success(data=result["items"], meta=result["meta"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_notification(notif_in: NotificationCreate, db: Session = Depends(get_db)):
    """Dispatch a new notification alert."""
    service = NotificationService(db)
    notif = service.create_notification(notif_in)
    return APIResponse.created(data=notif, message="Notification sent successfully")

@router.put("/{notification_id}/read")
def mark_notification_as_read(notification_id: UUID, db: Session = Depends(get_db)):
    """Mark a notification as read."""
    service = NotificationService(db)
    updated = service.mark_notification_read(notification_id)
    return APIResponse.success(data=updated, message="Notification marked as read")
