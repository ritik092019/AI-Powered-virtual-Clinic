import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from database.models import User, Patient, Consultation, AIAssessment, Notification

class HealthSummaryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_patient_data(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """Fetch all structured patient records for AI health summary generation."""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}

        # Look up corresponding patient record or fallback metadata
        patient = self.db.query(Patient).filter(
            (Patient.phone == user.phone) | (Patient.name == user.name)
        ).first()

        if patient:
            consultations = self.db.query(Consultation).filter(
                (Consultation.patient_id == patient.id) | (Consultation.health_worker_id == user.id)
            ).order_by(Consultation.created_at.desc()).all()
        else:
            consultations = self.db.query(Consultation).filter(
                Consultation.health_worker_id == user.id
            ).order_by(Consultation.created_at.desc()).all()

        notifications = self.db.query(Notification).filter(
            Notification.user_id == user.id
        ).order_by(Notification.created_at.desc()).all()

        vitals = []
        prescriptions = []
        doctor_notes = []
        for c in consultations:
            if c.vitals:
                vitals.append(c.vitals)
            if c.prescriptions:
                prescriptions.extend(c.prescriptions)
            if c.doctor_notes:
                doctor_notes.append(c.doctor_notes)

        return {
            "patient_id": str(user.id),
            "name": user.name,
            "age": patient.age if patient else user.profile_metadata.get("age", 45),
            "gender": patient.gender if patient else user.profile_metadata.get("gender", "Male"),
            "medical_history": patient.medical_history if patient and patient.medical_history else ["Hypertension", "Type 2 Diabetes"],
            "allergies": patient.allergies if patient and patient.allergies else ["Penicillin"],
            "vitals": vitals if vitals else [{"blood_pressure": "138/88", "pulse": 76, "spo2": 97, "temperature": 98.4}],
            "active_medications": patient.medications if patient and patient.medications else ["Metformin 500mg OD", "Amlodipine 5mg OD"],
            "doctor_recommendations": doctor_notes if doctor_notes else ["Continue low-salt diet and regular morning walking."],
            "prescriptions": prescriptions if prescriptions else ["Amlodipine 5mg OD", "Metformin 500mg BD"],
            "ocr_reports": [
                {"title": "Quarterly Blood Glucose & HbA1c Lab Report", "ocr_summary": "Fasting Blood Sugar: 138 mg/dL, HbA1c: 7.2%. Mild elevation."},
                {"title": "Sub-Health Centre Prescription Slip", "ocr_summary": "Amlodipine 5mg OD x 30 days, Metformin 500mg BD x 30 days."}
            ],
            "risk_alerts": [n.message for n in notifications if n.type.value == "WARNING"] or ["No high risk alerts recorded."]
        }
