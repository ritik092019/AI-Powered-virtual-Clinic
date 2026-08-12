from fastapi import APIRouter
from app.common.responses import APIResponse

router = APIRouter(prefix="/risk", tags=["Risk Stratification"])

@router.get("")
def get_risk_levels():
    return APIResponse.success(data=[], message="Risk analysis module ready")
