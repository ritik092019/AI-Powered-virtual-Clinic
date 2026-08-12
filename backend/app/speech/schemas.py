from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.common.enums import ProcessingStatus

class TranscriptSegment(BaseModel):
    start_time: float
    end_time: float
    text: str
    speaker: Optional[str] = "Health Worker"

class TranscriptRequest(BaseModel):
    audio_url: str
    language: Optional[str] = "hi" # Hindi, Telugu, Tamil, English, etc.
    consultation_id: Optional[str] = None

class TranscriptUpdateSchema(BaseModel):
    editable_text: str

class TranscriptResponse(BaseModel):
    transcript_id: str
    audio_url: str
    language: str
    raw_text: str
    editable_text: str
    confidence: float = Field(default=0.92, ge=0.0, le=1.0)
    segments: List[TranscriptSegment] = Field(default_factory=list)
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)

class TTSSynthesisRequest(BaseModel):
    text: str
    language: Optional[str] = "hi"
    voice_gender: Optional[str] = "female"

class TTSSynthesisResponse(BaseModel):
    audio_url: str
    language: str
    text_length: int
    duration_seconds: float
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
