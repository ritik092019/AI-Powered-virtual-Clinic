import pytest
import uuid
from app.core.database import SessionLocal, Base, engine
from app.common.enums import UserRole, DoctorAvailabilityStatus, AppointmentStatus
from app.users.models import User
from app.doctors.models import DoctorAvailability
from app.appointments.models import Appointment
from app.appointments.services.ai_specialty_classifier import AISpecialtyClassifier
from app.appointments.services.doctor_matcher import DoctorMatcher

def test_ai_specialty_classifier_rules():
    spec1, source1, conf1 = AISpecialtyClassifier.classify_complaint("Severe chest pain and palpitations for 2 days")
    assert "Cardiologist" in spec1

    spec2, source2, conf2 = AISpecialtyClassifier.classify_complaint("Persistent dry cough and shortness of breath", duration="1 week")
    assert "Pulmonologist" in spec2

    spec3, source3, conf3 = AISpecialtyClassifier.classify_complaint("High blood sugar levels and excessive thirst")
    assert "Diabetologist" in spec3

def test_doctor_matcher_scoring():
    # Ensure tables exist
    import app.users.models
    import app.doctors.models
    Base.metadata.create_all(bind=engine)

    db_session = SessionLocal()
    try:
        # Create doctor user
        doctor = User(
            id=uuid.uuid4(),
            name="Dr. Ananya Sharma",
            email=f"doc_{uuid.uuid4().hex[:6]}@clinic.org",
            password="hashedpassword",
            role=UserRole.DOCTOR,
            language="Hindi",
            is_active=True,
            profile_metadata={"specialty": "Cardiologist (Heart Specialist)", "languages": ["Hindi", "English"]}
        )
        db_session.add(doctor)
        db_session.commit()

        availability = DoctorAvailability(
            user_id=doctor.id,
            status=DoctorAvailabilityStatus.AVAILABLE,
            specialty="Cardiologist (Heart Specialist)"
        )
        db_session.add(availability)
        db_session.commit()

        # Create patient appointment
        patient = User(
            id=uuid.uuid4(),
            name="Rajesh Patel",
            email=f"pat_{uuid.uuid4().hex[:6]}@clinic.org",
            password="hashedpassword",
            role=UserRole.PATIENT,
            language="Hindi",
            is_active=True
        )
        db_session.add(patient)
        db_session.commit()

        appointment = Appointment(
            id=uuid.uuid4(),
            patient_id=patient.id,
            symptoms="Chest pain and palpitations",
            preferred_language="Hindi",
            classified_specialty="Cardiologist (Heart Specialist)",
            status=AppointmentStatus.PENDING_QUEUE
        )
        db_session.add(appointment)
        db_session.commit()

        matcher = DoctorMatcher(db_session)
        matched_doc, score, notes = matcher.auto_match_doctor(appointment)

        assert matched_doc is not None
        assert matched_doc.id == doctor.id
        assert score >= 80.0
        assert appointment.status == AppointmentStatus.ASSIGNED
    finally:
        db_session.close()
