from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import NotificationType, RiskLevel

class NotificationCreate(BaseModel):
    user_id: UUID
    title: str
    message: str
    type: NotificationType = NotificationType.SYSTEM
    priority: RiskLevel = RiskLevel.MODERATE
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    navigation_target: Optional[str] = None

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: NotificationType
    priority: RiskLevel
    is_read: bool
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[UUID] = None
    navigation_target: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    unread_count: int

class NotificationUnreadCountResponse(BaseModel):
    user_id: UUID
    unread_count: int

class WebSocketEventMessage(BaseModel):
    event_type: str # doctor_request_created, doctor_request_accepted, doctor_message, etc.
    recipient_user_ids: List[UUID] = Field(default_factory=list)
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
