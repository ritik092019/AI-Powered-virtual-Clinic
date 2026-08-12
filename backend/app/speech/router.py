from fastapi import APIRouter, status
from app.speech.schemas import (
    TranscriptRequest, 
    TranscriptUpdateSchema, 
    TTSSynthesisRequest
)
from app.speech.services.speech_service import SpeechService
from app.common.responses import APIResponse

router = APIRouter(prefix="/speech", tags=["Speech-to-Text & Text-to-Speech"])

@router.post("/transcribe", status_code=status.HTTP_201_CREATED)
def transcribe_audio(req: TranscriptRequest):
    """Submit multilingual clinical audio for transcription (Hindi, Telugu, Tamil, Marathi, English)."""
    res = SpeechService.transcribe_audio(req)
    return APIResponse.created(data=res, message="Audio transcription completed")

@router.get("/transcript/{transcript_id}")
def get_transcript(transcript_id: str):
    """Retrieve transcript record by transcript_id."""
    res = SpeechService.get_transcript(transcript_id)
    return APIResponse.success(data=res)

@router.put("/transcript/{transcript_id}")
def update_transcript_text(transcript_id: str, update_in: TranscriptUpdateSchema):
    """Update editable transcript text."""
    res = SpeechService.update_transcript(transcript_id, update_in)
    return APIResponse.success(data=res, message="Transcript updated successfully")

@router.post("/synthesize")
def synthesize_speech(req: TTSSynthesisRequest):
    """Synthesize Text-to-Speech audio for clinical instructions or patient advice."""
    res = SpeechService.synthesize_speech(req)
    return APIResponse.success(data=res, message="Text-to-speech synthesized successfully")
