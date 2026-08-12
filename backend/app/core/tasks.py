import logging
import uuid
from typing import Dict, Any
from app.core.celery import celery_app
from app.common.enums import ProcessingStatus
from app.speech.services.speech_service import SpeechService
from app.speech.schemas import TranscriptRequest
from app.ocr.services.ocr_service import OCRService
from app.ocr.schemas import OCRProcessRequest
from app.images.services.vision_service import VisionService
from app.images.schemas import ImageAnalysisRequest
from app.ai.services.llm_service import LLMService

logger = logging.getLogger("virtual_clinic.tasks")

# Processing task state tracking store
TASK_STATE_STORE: Dict[str, Dict[str, Any]] = {}

@celery_app.task(name="tasks.process_audio_transcription", bind=True, max_retries=3, default_retry_delay=10)
def process_audio_transcription_task(self, audio_url: str, language: str = "hi", consultation_id: str = None):
    """Async background task for audio transcription with retry & timeout handling."""
    task_id = self.request.id or str(uuid.uuid4())
    TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.PROCESSING.value, "progress": 10}
    try:
        req = TranscriptRequest(audio_url=audio_url, language=language, consultation_id=consultation_id)
        result = SpeechService.transcribe_audio(req)
        TASK_STATE_STORE[task_id] = {
            "status": ProcessingStatus.COMPLETED.value,
            "result": result.model_dump(mode="json"),
            "progress": 100
        }
        return result.model_dump(mode="json")
    except Exception as exc:
        logger.error(f"Audio transcription task '{task_id}' failed: {exc}")
        TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.FAILED.value, "error": str(exc)}
        raise self.retry(exc=exc)

@celery_app.task(name="tasks.process_medical_ocr", bind=True, max_retries=3, default_retry_delay=10)
def process_medical_ocr_task(self, document_url: str, document_type: str = "LAB_REPORT"):
    """Async background task for medical document OCR with retry & timeout handling."""
    task_id = self.request.id or str(uuid.uuid4())
    TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.PROCESSING.value, "progress": 10}
    try:
        req = OCRProcessRequest(document_url=document_url, document_type=document_type)
        result = OCRService.process_document(req)
        TASK_STATE_STORE[task_id] = {
            "status": ProcessingStatus.COMPLETED.value,
            "result": result.model_dump(mode="json"),
            "progress": 100
        }
        return result.model_dump(mode="json")
    except Exception as exc:
        logger.error(f"Medical OCR task '{task_id}' failed: {exc}")
        TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.FAILED.value, "error": str(exc)}
        raise self.retry(exc=exc)

@celery_app.task(name="tasks.analyze_medical_image", bind=True, max_retries=3, default_retry_delay=10)
def analyze_medical_image_task(self, image_url: str, image_category: str = "GENERAL"):
    """Async background task for medical computer vision analysis."""
    task_id = self.request.id or str(uuid.uuid4())
    TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.PROCESSING.value, "progress": 10}
    try:
        req = ImageAnalysisRequest(image_url=image_url, image_category=image_category)
        result = VisionService.analyze_image(req)
        TASK_STATE_STORE[task_id] = {
            "status": ProcessingStatus.COMPLETED.value,
            "result": result.model_dump(mode="json"),
            "progress": 100
        }
        return result.model_dump(mode="json")
    except Exception as exc:
        logger.error(f"Image analysis task '{task_id}' failed: {exc}")
        TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.FAILED.value, "error": str(exc)}
        raise self.retry(exc=exc)

@celery_app.task(name="tasks.generate_ai_assessment", bind=True, max_retries=3, default_retry_delay=10)
def generate_ai_assessment_task(self, consultation_data: dict):
    """Async background task for preliminary AI assessment generation."""
    task_id = self.request.id or str(uuid.uuid4())
    TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.PROCESSING.value, "progress": 10}
    try:
        result = LLMService.generate_assessment(consultation_data)
        TASK_STATE_STORE[task_id] = {
            "status": ProcessingStatus.COMPLETED.value,
            "result": result.model_dump(mode="json"),
            "progress": 100
        }
        return result.model_dump(mode="json")
    except Exception as exc:
        logger.error(f"AI assessment task '{task_id}' failed: {exc}")
        TASK_STATE_STORE[task_id] = {"status": ProcessingStatus.FAILED.value, "error": str(exc)}
        raise self.retry(exc=exc)
