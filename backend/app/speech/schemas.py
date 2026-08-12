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

class VoiceAssistantRequest(BaseModel):
    audio_base64: Optional[str] = Field(None, description="Base64 encoded microphone audio recording")
    language: str = Field(default="hi", description="Regional language code e.g. hi, te, ta, mr, bn, en")
    user_transcript: Optional[str] = Field(None, description="User typed or edited transcript text")
    user_role: Optional[str] = Field(default="HEALTH_WORKER", description="PATIENT or HEALTH_WORKER")

class VoiceAssistantResponse(BaseModel):
    assistant_id: str
    language: str
    language_name: str
    raw_transcript: str
    editable_transcript: str
    extracted_symptoms: List[str] = Field(default_factory=list)
    ai_response_text: str
    urgency_level: str = Field(default="MODERATE", description="LOW, MODERATE, HIGH, EMERGENCY")
    recommended_precautions: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    status: ProcessingStatus = Field(default=ProcessingStatus.COMPLETED)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)

