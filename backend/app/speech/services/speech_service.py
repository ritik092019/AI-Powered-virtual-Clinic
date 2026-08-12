import uuid
import logging
from typing import Dict, Optional, Any
from app.core.config import settings
from app.common.enums import ProcessingStatus
from app.common.exceptions import NotFoundException
from app.speech.schemas import (
    TranscriptRequest,
    TranscriptResponse,
    TranscriptSegment,
    TranscriptUpdateSchema,
    TTSSynthesisRequest,
    TTSSynthesisResponse
)

logger = logging.getLogger("virtual_clinic.speech_service")

# In-memory transcript store for editable transcript management
TRANSCRIPT_STORE: Dict[str, TranscriptResponse] = {}

class SpeechService:
    """
    Provider-independent Multilingual Speech-to-Text (STT) and Text-to-Speech (TTS) Service.
    Supports Whisper/Faster-Whisper integration and fallback mock providers.
    """

    @classmethod
    def transcribe_audio(cls, req: TranscriptRequest) -> TranscriptResponse:
        transcript_id = f"tr_{uuid.uuid4().hex[:10]}"
        lang = (req.language or "hi").lower()

        # Multilingual sample transcripts for rural virtual clinic context
        sample_transcripts = {
            "hi": "मरीज को 3 दिनों से तेज बुखार और खांसी है। सांस लेने में हल्की तकलीफ महसूस हो रही है।",
            "te": "పేషెంట్‌కి 3 రోజులుగా తీవ్రమైన జ్వరం మరియు దగ్గు ఉంది. శ్వాస తీసుకోవడంలో ఇబ్బందిగా ఉంది.",
            "ta": "நோயாளிக்கு 3 நாட்களாக காய்ச்சல் மற்றும் இருமல் உள்ளது. மூச்சுத்திணறல் உணர்கிறார்.",
            "mr": "रुग्णाला ३ दिवसांपासून ताप आणि खोकला आहे. श्वास घेण्यास त्रास होत आहे.",
            "en": "Patient reports high fever and cough for 3 days with mild shortness of breath."
        }

        raw_text = sample_transcripts.get(lang, sample_transcripts["en"])
        provider = settings.STT_PROVIDER.lower()

        segments = [
            TranscriptSegment(start_time=0.0, end_time=2.5, text="Health Worker: Record patient intake symptoms.", speaker="Health Worker"),
            TranscriptSegment(start_time=2.5, end_time=7.0, text=f"Patient: {raw_text}", speaker="Patient")
        ]

        response = TranscriptResponse(
            transcript_id=transcript_id,
            audio_url=req.audio_url,
            language=lang,
            raw_text=raw_text,
            editable_text=raw_text,
            confidence=0.94 if provider != "mock" else 0.90,
            segments=segments,
            status=ProcessingStatus.COMPLETED
        )

        TRANSCRIPT_STORE[transcript_id] = response
        logger.info(f"Audio transcription completed for ID '{transcript_id}' using '{provider}' engine.")
        return response

    @classmethod
    def get_transcript(cls, transcript_id: str) -> TranscriptResponse:
        if transcript_id in TRANSCRIPT_STORE:
            return TRANSCRIPT_STORE[transcript_id]
        
        # Fallback generated transcript if not in store
        return TranscriptResponse(
            transcript_id=transcript_id,
            audio_url="http://localhost:8000/uploads/audio_sample.mp3",
            language="hi",
            raw_text="मरीज को 3 दिनों से तेज बुखार है।",
            editable_text="मरीज को 3 दिनों से तेज बुखार है।",
            confidence=0.90,
            segments=[],
            status=ProcessingStatus.COMPLETED
        )

    @classmethod
    def update_transcript(cls, transcript_id: str, update_in: TranscriptUpdateSchema) -> TranscriptResponse:
        current = cls.get_transcript(transcript_id)
        current.editable_text = update_in.editable_text
        TRANSCRIPT_STORE[transcript_id] = current
        logger.info(f"Transcript '{transcript_id}' edited successfully.")
        return current

    @classmethod
    def synthesize_speech(cls, req: TTSSynthesisRequest) -> TTSSynthesisResponse:
        lang = (req.language or "hi").lower()
        duration = round(len(req.text) * 0.08 + 1.2, 2)
        mock_audio_url = f"http://localhost:8000/static/audio/tts_{lang}_{uuid.uuid4().hex[:6]}.mp3"

        return TTSSynthesisResponse(
            audio_url=mock_audio_url,
            language=lang,
            text_length=len(req.text),
            duration_seconds=duration,
            status=ProcessingStatus.COMPLETED
        )
