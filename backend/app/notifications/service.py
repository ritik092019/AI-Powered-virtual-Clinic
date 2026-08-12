import uuid
import logging
import asyncio
from typing import List, Optional
from sqlalchemy.orm import Session
from app.notifications.repository import NotificationRepository
from app.notifications.websocket_manager import websocket_manager
from app.notifications.schemas import (
    NotificationCreate,
    NotificationResponse,
    NotificationListResponse,
    NotificationUnreadCountResponse
)
from app.common.enums import NotificationType, RiskLevel
from app.common.exceptions import NotFoundException
from app.audit.service import log_audit_event

logger = logging.getLogger("virtual_clinic.notification_service")

class NotificationService:
    """
    Reusable, provider-independent Notification Service.
    Persists notifications in PostgreSQL and dispatches real-time WebSocket events.
    """
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def send_notification(
        self,
        user_id: uuid.UUID,
        title: str,
        message: str,
        type: NotificationType = NotificationType.SYSTEM,
        priority: RiskLevel = RiskLevel.MODERATE,
        event_type: Optional[str] = None,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[uuid.UUID] = None,
        navigation_target: Optional[str] = None
    ) -> NotificationResponse:
        # 1. Persist notification to DB
        notif = self.repo.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            priority=priority,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            navigation_target=navigation_target
        )

        res = NotificationResponse.model_validate(notif)
        evt_name = event_type or f"notification_{type.value.lower()}"

        # 2. Async dispatch real-time WebSocket event
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(
                websocket_manager.send_personal_event(
                    user_id=user_id,
                    event_type=evt_name,
                    payload=res.model_dump(mode="json")
                )
            )
        except RuntimeError:
            # If no running event loop (e.g. sync script execution), run safely
            pass

        log_audit_event(
            action="NOTIFICATION_SENT",
            performed_by=user_id,
            target_resource="NOTIFICATION",
            resource_id=notif.id,
            details={"title": title, "type": type}
        )
        logger.info(f"Notification '{notif.id}' sent to user '{user_id}' with event '{evt_name}'.")
        return res

    def get_user_notifications(
        self,
        user_id: uuid.UUID,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> NotificationListResponse:
        notifications, total, unread_count = self.repo.list_user_notifications(
            user_id=user_id,
            unread_only=unread_only,
            limit=limit,
            offset=offset
        )
        res_items = [NotificationResponse.model_validate(n) for n in notifications]
        return NotificationListResponse(
            notifications=res_items,
            total=total,
            unread_count=unread_count
        )

    def mark_notification_read(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> NotificationResponse:
        notif = self.repo.mark_as_read(notification_id, user_id)
        if not notif:
            raise NotFoundException(f"Notification '{notification_id}' not found for user.")
        return NotificationResponse.model_validate(notif)

    def mark_all_notifications_read(self, user_id: uuid.UUID) -> int:
        count = self.repo.mark_all_as_read(user_id)
        log_audit_event(
            action="NOTIFICATIONS_BULK_READ",
            performed_by=user_id,
            target_resource="NOTIFICATION",
            details={"count": count}
        )
        return count

    def get_unread_count(self, user_id: uuid.UUID) -> NotificationUnreadCountResponse:
        count = self.repo.get_unread_count(user_id)
        return NotificationUnreadCountResponse(user_id=user_id, unread_count=count)
