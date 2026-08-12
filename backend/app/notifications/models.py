import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import NotificationType, RiskLevel

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType, name="notification_type"), nullable=False, index=True)
    priority = Column(SQLEnum(RiskLevel, name="risk_level"), nullable=False, default=RiskLevel.MODERATE, index=True)
    
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    
    related_entity_type = Column(String(100), nullable=True) # CONSULTATION, DOCTOR_REQUEST, DOCUMENT, PATIENT
    related_entity_id = Column(UUID(as_uuid=True), nullable=True)
    navigation_target = Column(String(255), nullable=True) # e.g. /consultations/uuid or /doctor-queue/uuid
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    __table_args__ = (
        Index('idx_notifications_user_unread', 'user_id', 'is_read', created_at.desc()),
    )

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.type}', is_read={self.is_read})>"
