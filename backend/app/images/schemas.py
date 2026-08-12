from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import ProcessingStatus

class ImageAnalysisRequest(BaseModel):
    image_url: str
    image_category: Optional[str] = "GENERAL" # SKIN, ECG, WOUND, GENERAL

class ImageObservationResponse(BaseModel):
    image_id: str
    image_url: str
    observations: List[str] = Field(default_factory=list, description="Visual observations extracted from image")
    ai_interpretation: Optional[str] = Field(None, description="Non-diagnostic visual feature interpretation")
    confidence: float = Field(default=0.88, ge=0.0, le=1.0)
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)
