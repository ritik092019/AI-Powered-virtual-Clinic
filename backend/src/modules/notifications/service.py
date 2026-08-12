import uuid
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.modules.notifications.repository import NotificationRepository
from src.schemas.notification import NotificationCreate, NotificationResponse
from src.core.exceptions import NotFoundException
from src.core.pagination import create_paginated_response

class NotificationService:
    def __init__(self, db: Session):
        self.repo = NotificationRepository(db)

    def create_notification(self, notif_in: NotificationCreate) -> NotificationResponse:
        notif = self.repo.create(notif_in.model_dump())
        return NotificationResponse.model_validate(notif)

    def list_user_notifications(
        self, 
        user_id: uuid.UUID, 
        unread_only: bool = False, 
        page: int = 1, 
        limit: int = 10
    ) -> Dict[str, Any]:
        skip = (page - 1) * limit
        items, total = self.repo.list_by_user(user_id=user_id, unread_only=unread_only, skip=skip, limit=limit)
        responses = [NotificationResponse.model_validate(n) for n in items]
        return create_paginated_response(responses, total, page, limit)

    def mark_notification_read(self, notification_id: uuid.UUID) -> NotificationResponse:
        notif = self.repo.get_by_id(notification_id)
        if not notif:
            raise NotFoundException(f"Notification '{notification_id}' not found")
        updated = self.repo.mark_as_read(notif)
        return NotificationResponse.model_validate(updated)
