import sys
import os
import uuid

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    import pytest
except ImportError:
    pytest = None

from app.common.enums import RiskLevel, ProcessingStatus
from app.ai.services.llm_service import LLMService
from app.speech.services.speech_service import SpeechService
from app.speech.schemas import TranscriptRequest, TranscriptUpdateSchema, TTSSynthesisRequest
from app.ocr.services.ocr_service import OCRService
from app.ocr.schemas import OCRProcessRequest
from app.images.services.vision_service import VisionService
from app.images.schemas import ImageAnalysisRequest
from app.core.tasks import (
    process_audio_transcription_task,
    process_medical_ocr_task,
    analyze_medical_image_task,
    generate_ai_assessment_task
)

class MockTaskContext:
    request = type("Req", (), {"id": "mock_task_id_123"})()
    def retry(self, exc=None):
        return exc

def test_llm_service_fact_and_interpretation_separation():
    consultation_data = {
        "consultation_id": uuid.uuid4(),
        "chief_complaint": "Persistent fever and shortness of breath",
        "symptoms": [
            {"name": "Fever", "severity": 8, "duration": "3 days"},
            {"name": "Cough", "severity": 6, "duration": "2 days"}
        ],
        "vitals": {
            "temperature": {"value": 102.0, "unit": "F"},
            "spo2": {"value": 93.0, "unit": "%"},
            "blood_pressure": {"systolic": 130, "diastolic": 85}
        }
    }

    res = LLMService.generate_assessment(consultation_data)
    assert res.status == ProcessingStatus.COMPLETED
    assert len(res.extracted_facts) >= 3
    assert any("Chief Complaint" in f for f in res.extracted_facts)
    assert any("Temperature: 102.0 F" in f for f in res.extracted_facts)
    assert len(res.ai_interpretation) > 0
    assert res.risk_level == RiskLevel.MODERATE

def test_llm_service_missing_information_detection():
    consultation_data = {
        "consultation_id": uuid.uuid4(),
        "chief_complaint": "Headache",
        "symptoms": [],
        "vitals": {} # Missing temperature, SpO2, BP
    }

    res = LLMService.generate_assessment(consultation_data)
    assert len(res.missing_information) >= 3
    assert any("Temperature" in m for m in res.missing_information)
    assert any("SpO2" in m for m in res.missing_information)
    assert any("Blood Pressure" in m for m in res.missing_information)

def test_speech_service_multilingual_stt_and_editing():
    req_hi = TranscriptRequest(audio_url="http://localhost:8000/audio/sample_hi.mp3", language="hi")
    res_hi = SpeechService.transcribe_audio(req_hi)
    assert res_hi.language == "hi"
    assert res_hi.raw_text != ""
    assert res_hi.status == ProcessingStatus.COMPLETED

    edited_text = "मरीज को 3 दिनों से तेज बुखार है और खांसी है।"
    updated = SpeechService.update_transcript(res_hi.transcript_id, TranscriptUpdateSchema(editable_text=edited_text))
    assert updated.editable_text == edited_text

def test_speech_service_tts_synthesis():
    req = TTSSynthesisRequest(text="Take paracetamol twice daily after meals", language="hi")
    res = SpeechService.synthesize_speech(req)
    assert res.status == ProcessingStatus.COMPLETED
    assert res.audio_url.endswith(".mp3")
    assert res.duration_seconds > 0

def test_ocr_service_lab_report_fact_extraction():
    req = OCRProcessRequest(document_url="http://localhost:8000/docs/lab_report.pdf", document_type="LAB_REPORT")
    res = OCRService.process_document(req)
    assert res.status == ProcessingStatus.COMPLETED
    assert res.extracted_facts["document_type"] == "LAB_REPORT"
    assert len(res.extracted_facts["lab_results"]) >= 3
    assert res.confidence >= 0.85

def test_vision_service_feature_observation():
    req = ImageAnalysisRequest(image_url="http://localhost:8000/images/skin_rash.jpg", image_category="SKIN")
    res = VisionService.analyze_image(req)
    assert res.status == ProcessingStatus.COMPLETED
    assert len(res.observations) > 0
    assert "rash" in res.observations[0].lower()

def test_async_tasks_execution():
    ctx = MockTaskContext()
    stt_res = process_audio_transcription_task(ctx, audio_url="http://localhost:8000/audio.mp3", language="en")
    assert stt_res["status"] == ProcessingStatus.COMPLETED.value

    ocr_res = process_medical_ocr_task(ctx, document_url="http://localhost:8000/doc.pdf", document_type="PRESCRIPTION")
    assert ocr_res["status"] == ProcessingStatus.COMPLETED.value

    img_res = analyze_medical_image_task(ctx, image_url="http://localhost:8000/img.jpg", image_category="ECG")
    assert img_res["status"] == ProcessingStatus.COMPLETED.value

    ai_res = generate_ai_assessment_task(ctx, consultation_data={"consultation_id": str(uuid.uuid4()), "chief_complaint": "Fever"})
    assert ai_res["status"] == ProcessingStatus.COMPLETED.value

if __name__ == "__main__":
    test_llm_service_fact_and_interpretation_separation()
    test_llm_service_missing_information_detection()
    test_speech_service_multilingual_stt_and_editing()
    test_speech_service_tts_synthesis()
    test_ocr_service_lab_report_fact_extraction()
    test_vision_service_feature_observation()
    test_async_tasks_execution()
    print("ALL AI MODULE UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!")
