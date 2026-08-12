from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from database.models import Notification

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, notification_id: UUID) -> Optional[Notification]:
        return self.db.query(Notification).filter(Notification.id == notification_id).first()

    def list_by_user(
        self, 
        user_id: UUID, 
        unread_only: bool = False, 
        skip: int = 0, 
        limit: int = 10
    ) -> Tuple[List[Notification], int]:
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        total = query.count()
        items = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def create(self, notification_data: dict) -> Notification:
        notif = Notification(**notification_data)
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def mark_as_read(self, notif: Notification) -> Notification:
        notif.is_read = True
        self.db.commit()
        self.db.refresh(notif)
        return notif
