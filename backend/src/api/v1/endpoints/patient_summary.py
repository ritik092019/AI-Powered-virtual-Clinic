from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.response import APIResponse
from src.schemas.ai_summary import HealthSummaryResponse
from src.modules.health_summary.service import HealthSummaryService
from database.models import User

router = APIRouter(prefix="/patient-summary", tags=["Patient Personal AI Summary"])

@router.post("/generate", status_code=status.HTTP_200_OK)
def generate_personal_health_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate or refresh the authenticated patient's personal AI health summary.
    Restricted to authenticated patient profile with RBAC protections.
    """
    service = HealthSummaryService(db)
    summary: HealthSummaryResponse = service.generate_patient_summary(current_user.id)
    return APIResponse.success(data=summary.model_dump(), message="Personal AI Health Summary generated successfully")

@router.get("/health-summary/my")
def get_my_health_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve existing cached personal AI health summary for current patient."""
    service = HealthSummaryService(db)
    summary: HealthSummaryResponse = service.generate_patient_summary(current_user.id)
    return APIResponse.success(data=summary.model_dump())
