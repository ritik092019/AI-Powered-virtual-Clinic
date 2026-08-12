import pytest
from app.consultations.schemas import (
    Symptom, 
    VitalSigns, 
    VitalValue, 
    BloodPressureValue,
    SymptomValidationRequest,
    VitalsValidationRequest
)
from app.consultations.service import ConsultationService

def test_symptom_validation():
    symptoms = [
        Symptom(name="Fever", severity=8, duration="3 days"),
        Symptom(name="Cough", severity=5, duration="2 days")
    ]
    req = SymptomValidationRequest(symptoms=symptoms)
    res = ConsultationService.validate_symptoms(req)
    assert res.valid is True
    assert len(res.errors) == 0

def test_vitals_validation_and_warnings():
    vitals = VitalSigns(
        temperature=VitalValue(value=102.5, unit="F"),
        spo2=VitalValue(value=92.0, unit="%"),
        blood_pressure=BloodPressureValue(systolic=150, diastolic=95)
    )
    req = VitalsValidationRequest(vitals=vitals)
    res = ConsultationService.validate_vitals(req)
    assert res.valid is True
    assert len(res.warnings) == 3 # Fever, Hypoxia, Elevated BP
