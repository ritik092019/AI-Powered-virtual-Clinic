from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from database.models.enums import NotificationType

class NotificationBase(BaseModel):
    user_id: UUID
    title: str
    message: str
    type: NotificationType
    related_id: Optional[UUID] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: UUID
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
