from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.triage.models import AIAssessment

class AITriageRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, assessment_id: UUID) -> Optional[AIAssessment]:
        return self.db.query(AIAssessment).filter(AIAssessment.id == assessment_id).first()

    def get_latest_by_consultation(self, consultation_id: UUID) -> Optional[AIAssessment]:
        return (
            self.db.query(AIAssessment)
            .filter(AIAssessment.consultation_id == consultation_id)
            .order_by(AIAssessment.created_at.desc())
            .first()
        )

    def list_by_consultation(self, consultation_id: UUID) -> List[AIAssessment]:
        return (
            self.db.query(AIAssessment)
            .filter(AIAssessment.consultation_id == consultation_id)
            .order_by(AIAssessment.created_at.desc())
            .all()
        )

    def create(self, assessment_data: dict) -> AIAssessment:
        assessment = AIAssessment(**assessment_data)
        self.db.add(assessment)
        self.db.commit()
        self.db.refresh(assessment)
        return assessment
