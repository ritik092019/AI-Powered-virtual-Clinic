import uuid
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.users.models import User
from app.patients.models import Patient
from app.consultations.models import Consultation
from app.doctors.models import DoctorRequest
from app.common.enums import UserRole, RiskLevel, DoctorRequestStatus, ConsultationStatus
from app.core.security import get_password_hash

logger = logging.getLogger("virtual_clinic.seed")

def seed_initial_database():
    db: Session = SessionLocal()
    try:
        if db.query(Consultation).first() is None:
            hw_user = db.query(User).filter(User.role == UserRole.HEALTH_WORKER).first()
            doc_user = db.query(User).filter(User.role == UserRole.DOCTOR).first()
            patient = db.query(Patient).first()

            if not hw_user:
                hw_user = User(
                    id=uuid.UUID("a1111111-1111-4111-a111-111111111111"),
                    name="Anita Sharma",
                    email="healthworker@clinic.org",
                    password=get_password_hash("password123"),
                    role=UserRole.HEALTH_WORKER,
                    phone="+91 98765 11111",
                    language="hi",
                    profile_metadata={"centerName": "Sub-Health Centre Rampur", "district": "Surguja"},
                )
                db.add(hw_user)

            if not doc_user:
                doc_user = User(
                    id=uuid.UUID("a9110000-0000-4000-a000-000000000001"),
                    name="Dr. Rajesh Verma",
                    email="doctor@clinic.org",
                    password=get_password_hash("password123"),
                    role=UserRole.DOCTOR,
                    phone="+91 98765 22222",
                    language="en",
                    profile_metadata={
                        "specialty": "Senior Tele-Consultant / General Medicine",
                        "qualifications": "MBBS, MD",
                        "registration_number": "MCI-889021",
                    },
                )
                db.add(doc_user)

            if not patient:
                patient = Patient(
                    id=uuid.UUID("ca18fdee-7d8c-4bb2-98e9-4841b92806ec"),
                    patient_code="PAT-1082",
                    name="Ramesh Patel",
                    age=54,
                    gender="Male",
                    phone="+91 98765 33333",
                    address="Village Rampur, Surguja District",
                    preferred_language="hi",
                    medical_history=["Type 2 Diabetes Mellitus", "Essential Hypertension"],
                    allergies=["Penicillin Group"],
                    medications=["Metformin 500mg BD", "Amlodipine 5mg OD"],
                )
                db.add(patient)

            db.commit()

            # Create Consultation Record
            consultation = Consultation(
                id=uuid.UUID("c1111111-1111-4111-a111-111111111111"),
                patient_id=patient.id,
                health_worker_id=hw_user.id,
                doctor_id=doc_user.id,
                status=ConsultationStatus.AWAITING_DOCTOR,
                chief_complaint="Elevated blood sugar and mild morning headache for 3 days",
                symptoms=["Headache", "Fatigue", "Increased Thirst"],
                vitals={"bpSystolic": 148, "bpDiastolic": 92, "pulseRate": 78, "tempFahrenheit": 98.6, "spo2Percentage": 97},
                medical_notes="Patient responds well to Metformin 500mg. Hydrate with 3L warm water daily.",
            )

            db.add(consultation)
            db.commit()

            # Create Doctor Request
            doc_req = DoctorRequest(
                id=uuid.UUID("d1111111-1111-4111-a111-111111111111"),
                consultation_id=consultation.id,
                patient_id=patient.id,
                doctor_id=doc_user.id,
                requested_by=hw_user.id,
                priority=RiskLevel.MODERATE,
                reason="Acute blood pressure fluctuation and prescription review",
                status=DoctorRequestStatus.PENDING,
            )

            db.add(doc_req)
            db.commit()

            logger.info("Successfully seeded consultations and doctor requests.")
            return

        logger.info("Seeding initial users, patients, and consultations into database...")

        # 1. Create Users
        hw_user = User(
            id=uuid.UUID("a1111111-1111-4111-a111-111111111111"),
            name="Anita Sharma",
            email="healthworker@clinic.org",
            password=get_password_hash("password123"),
            role=UserRole.HEALTH_WORKER,
            phone="+91 98765 11111",
            language="hi",
            profile_metadata={"centerName": "Sub-Health Centre Rampur", "district": "Surguja"},
        )

        doc_user = User(
            id=uuid.UUID("a9110000-0000-4000-a000-000000000001"),
            name="Dr. Rajesh Verma",
            email="doctor@clinic.org",
            password=get_password_hash("password123"),
            role=UserRole.DOCTOR,
            phone="+91 98765 22222",
            language="en",
            profile_metadata={
                "specialty": "Senior Tele-Consultant / General Medicine",
                "qualifications": "MBBS, MD",
                "registration_number": "MCI-889021",
            },
        )

        admin_user = User(
            id=uuid.UUID("a3333333-3333-4333-a333-333333333333"),
            name="Clinic System Admin",
            email="admin@clinic.org",
            password=get_password_hash("password123"),
            role=UserRole.ADMIN,
            phone="+91 98765 33333",
            language="en",
        )

        db.add_all([hw_user, doc_user, admin_user])
        db.commit()

        # 2. Create Patient Profile
        patient = Patient(
            id=uuid.UUID("ca18fdee-7d8c-4bb2-98e9-4841b92806ec"),
            patient_code="PAT-1082",
            name="Ramesh Patel",
            age=54,
            gender="Male",
            phone="+91 98765 33333",
            address="Village Rampur, Surguja District",
            preferred_language="hi",
            medical_history=["Type 2 Diabetes Mellitus", "Essential Hypertension"],
            allergies=["Penicillin Group"],
            medications=["Metformin 500mg BD", "Amlodipine 5mg OD"],
        )

        db.add(patient)
        db.commit()

        # 3. Create Consultation Record
        consultation = Consultation(
            id=uuid.UUID("c1111111-1111-4111-a111-111111111111"),
            patient_id=patient.id,
            health_worker_id=hw_user.id,
            doctor_id=doc_user.id,
            status=ConsultationStatus.AWAITING_DOCTOR,
            chief_complaint="Elevated blood sugar and mild morning headache for 3 days",
            symptoms=["Headache", "Fatigue", "Increased Thirst"],
            vitals={"bpSystolic": 148, "bpDiastolic": 92, "pulseRate": 78, "tempFahrenheit": 98.6, "spo2Percentage": 97},
            medical_notes="Patient responds well to Metformin 500mg. Hydrate with 3L warm water daily.",
        )

        db.add(consultation)
        db.commit()

        # 4. Create Doctor Request
        doc_req = DoctorRequest(
            id=uuid.UUID("d1111111-1111-4111-a111-111111111111"),
            consultation_id=consultation.id,
            patient_id=patient.id,
            doctor_id=doc_user.id,
            requested_by=hw_user.id,
            priority=RiskLevel.MODERATE,
            reason="Acute blood pressure fluctuation and prescription review",
            status=DoctorRequestStatus.PENDING,
        )

        db.add(doc_req)
        db.commit()

        logger.info("Successfully seeded database with initial clinic records.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_database()
