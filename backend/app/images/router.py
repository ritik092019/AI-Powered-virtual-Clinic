from fastapi import APIRouter, status
from app.images.schemas import ImageAnalysisRequest
from app.images.services.vision_service import VisionService
from app.common.responses import APIResponse

router = APIRouter(prefix="/images", tags=["Medical Image Analysis"])

@router.post("/analyze", status_code=status.HTTP_201_CREATED)
def analyze_medical_image(req: ImageAnalysisRequest):
    """Analyze medical image for non-diagnostic visual observations and features."""
    res = VisionService.analyze_image(req)
    return APIResponse.created(data=res, message="Medical image analysis completed")

@router.get("/observation/{image_id}")
def get_image_observation(image_id: str):
    """Retrieve medical image observation results by image_id."""
    res = VisionService.get_observation(image_id)
    return APIResponse.success(data=res)
