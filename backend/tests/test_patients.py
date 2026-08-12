import pytest
from app.patients.schemas import PatientCreate

def test_patient_schema_validation():
    data = {
        "name": "Test Patient",
        "age": 42,
        "gender": "Male",
        "phone": "+91-9876543210",
        "address": "Sample Village",
        "preferred_language": "hi",
        "medical_history": ["Hypertension"],
        "allergies": ["Penicillin"],
        "medications": ["Amlodipine"]
    }
    patient_in = PatientCreate(**data)
    assert patient_in.name == "Test Patient"
    assert patient_in.age == 42
    assert "Hypertension" in patient_in.medical_history
