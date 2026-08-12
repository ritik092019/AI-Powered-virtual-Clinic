from fastapi import APIRouter
from app.common.responses import APIResponse

router = APIRouter(prefix="/protocols", tags=["Clinical Protocols"])

@router.get("")
def list_protocols():
    return APIResponse.success(data=[], message="Clinical protocols module ready")
