import uuid
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.notifications.models import Notification
from app.common.enums import NotificationType, RiskLevel

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_notification(
        self,
        user_id: uuid.UUID,
        title: str,
        message: str,
        type: NotificationType = NotificationType.SYSTEM,
        priority: RiskLevel = RiskLevel.MODERATE,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[uuid.UUID] = None,
        navigation_target: Optional[str] = None
    ) -> Notification:
        now = datetime.now(timezone.utc)
        notif = Notification(
            id=uuid.uuid4(),
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            priority=priority,
            is_read=False,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            navigation_target=navigation_target,
            created_at=now
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def list_user_notifications(
        self,
        user_id: uuid.UUID,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Notification], int, int]:
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read.is_(False))

        total = query.count()
        unread_count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False)
        ).count()

        notifications = query.order_by(desc(Notification.created_at)).offset(offset).limit(limit).all()
        return notifications, total, unread_count

    def get_notification(self, notification_id: uuid.UUID) -> Optional[Notification]:
        return self.db.query(Notification).filter(Notification.id == notification_id).first()

    def mark_as_read(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        notif = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            self.db.refresh(notif)
        return notif

    def mark_all_as_read(self, user_id: uuid.UUID) -> int:
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False)
        ).update({"is_read": True}, synchronize_session=False)
        self.db.commit()
        return count

    def get_unread_count(self, user_id: uuid.UUID) -> int:
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False)
        ).count()
