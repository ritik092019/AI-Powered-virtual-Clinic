import uuid
from sqlalchemy import Column, String, Text, Numeric, DateTime, ForeignKey, Enum as SQLEnum, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from src.db.base import Base
from src.models.enums import RiskLevel, AIAssessmentStatus

class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = Column(UUID(as_uuid=True), ForeignKey("consultations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    summary = Column(Text, nullable=True)
    observations = Column(JSONB, server_default='[]', nullable=False)
    missing_information = Column(JSONB, server_default='[]', nullable=False)
    
    risk_level = Column(SQLEnum(RiskLevel, name="risk_level"), nullable=False, index=True)
    risk_reason = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    confidence = Column(Numeric(5, 2), nullable=True)
    model_name = Column(String(100), nullable=True)
    
    status = Column(
        SQLEnum(AIAssessmentStatus, name="ai_assessment_status"), 
        nullable=False, 
        default=AIAssessmentStatus.PENDING, 
        index=True
    )
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    consultation = relationship("Consultation", back_populates="ai_assessments")

    def __repr__(self):
        return f"<AIAssessment(id={self.id}, consultation_id={self.consultation_id}, risk_level='{self.risk_level}')>"
