from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.schemas.consultation import SymptomValidationRequest
from src.modules.consultations.service import ConsultationService
from src.core.response import APIResponse

router = APIRouter(prefix="/symptoms", tags=["Symptoms & Clinical Reference"])

COMMON_RURAL_SYMPTOMS = [
    {"name": "Fever", "category": "General", "common_durations": ["1 day", "2 days", "3 days", "1 week"]},
    {"name": "Cough", "category": "Respiratory", "common_durations": ["3 days", "5 days", "2 weeks"]},
    {"name": "Shortness of Breath", "category": "Respiratory", "common_durations": ["1 hour", "1 day", "3 days"]},
    {"name": "Headache", "category": "Neurological", "common_durations": ["1 day", "2 days"]},
    {"name": "Dizziness", "category": "Neurological", "common_durations": ["1 hour", "1 day"]},
    {"name": "Chest Pain / Tightness", "category": "Cardiovascular", "common_durations": ["30 mins", "2 hours", "1 day"]},
    {"name": "Abdominal Pain", "category": "Gastrointestinal", "common_durations": ["1 day", "3 days"]},
    {"name": "Diarrhea", "category": "Gastrointestinal", "common_durations": ["1 day", "2 days", "5 days"]},
    {"name": "Skin Rash", "category": "Dermatology", "common_durations": ["2 days", "1 week"]},
    {"name": "Joint Pain", "category": "Musculoskeletal", "common_durations": ["1 week", "1 month"]}
]

@router.get("/common")
def get_common_rural_symptoms():
    """Retrieve reference list of common symptoms for quick UI selection."""
    return APIResponse.success(data=COMMON_RURAL_SYMPTOMS)

@router.post("/validate")
def validate_symptoms_payload(req: SymptomValidationRequest):
    """Validate symptom names, severity ratings (1-10), and duration strings."""
    res = ConsultationService.validate_symptoms(req)
    return APIResponse.success(data=res)
