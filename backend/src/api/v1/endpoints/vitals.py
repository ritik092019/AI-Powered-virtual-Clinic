from fastapi import APIRouter
from src.schemas.consultation import VitalsValidationRequest
from src.modules.consultations.service import ConsultationService
from src.core.response import APIResponse

router = APIRouter(prefix="/vitals", tags=["Vital Signs Validation"])

@router.post("/validate")
def validate_vitals_payload(req: VitalsValidationRequest):
    """Validate vital signs physiological bounds and flag clinical warnings."""
    res = ConsultationService.validate_vitals(req)
    return APIResponse.success(data=res)
