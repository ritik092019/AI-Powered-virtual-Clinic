from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.users.models import User
from app.notifications.service import NotificationService
from app.common.responses import APIResponse

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

@router.get("")
def list_user_notifications(
    unread_only: bool = Query(False, description="Filter unread notifications only"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve notifications for authenticated user."""
    service = NotificationService(db)
    res = service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit,
        offset=offset
    )
    return APIResponse.success(data=res)

@router.get("/unread-count")
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve unread notification count for authenticated user."""
    service = NotificationService(db)
    res = service.get_unread_count(current_user.id)
    return APIResponse.success(data=res)

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark individual notification as read."""
    service = NotificationService(db)
    res = service.mark_notification_read(notification_id, current_user.id)
    return APIResponse.success(data=res, message="Notification marked as read")

@router.post("/mark-all-read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all unread notifications as read for current user in bulk."""
    service = NotificationService(db)
    count = service.mark_all_notifications_read(current_user.id)
    return APIResponse.success(data={"updated_count": count}, message=f"Marked {count} notifications as read")
