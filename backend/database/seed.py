import sys
import os
import uuid
from datetime import datetime, timezone

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database.session import SessionLocal, engine
from database.base import Base
from database.models import (
    User, UserRole,
    Patient,
    Consultation, ConsultationStatus,
    AIAssessment, RiskLevel, AIAssessmentStatus,
    DoctorRequest, DoctorRequestStatus,
    Notification, NotificationType
)

def seed_database():
    print("Initializing Database tables (if not already created)...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if DB is already seeded
        if db.query(User).first():
            print("Database already contains seed data. Clearing existing demo records for a clean re-seed...")
            db.query(Notification).delete()
            db.query(DoctorRequest).delete()
            db.query(AIAssessment).delete()
            db.query(Consultation).delete()
            db.query(Patient).delete()
            db.query(User).delete()
            db.commit()

        print("Seeding Users...")
        hashed_pwd = "$2b$12$eImiTXuWVxfM37uY4JANjO5E/8vGZzJq2qS.Y1s/pLhWv0gYk/mGu"
        
        hw1 = User(
            id=uuid.uuid4(),
            name="Ramesh Kumar (Health Worker)",
            email="hw1.ramesh@ruralclinic.demo",
            password=hashed_pwd,
            role=UserRole.HEALTH_WORKER,
            phone="+91-9876543210",
            language="hi"
        )
        hw2 = User(
            id=uuid.uuid4(),
            name="Sunita Devi (Health Worker)",
            email="hw2.sunita@ruralclinic.demo",
            password=hashed_pwd,
            role=UserRole.HEALTH_WORKER,
            phone="+91-9876543211",
            language="te"
        )
        dr1 = User(
            id=uuid.uuid4(),
            name="Dr. Ananya Sharma (General Physician)",
            email="dr.sharma@ruralclinic.demo",
            password=hashed_pwd,
            role=UserRole.DOCTOR,
            phone="+91-9876543212",
            language="en"
        )
        dr2 = User(
            id=uuid.uuid4(),
            name="Dr. Rajesh Patel (Pediatric Specialist)",
            email="dr.patel@ruralclinic.demo",
            password=hashed_pwd,
            role=UserRole.DOCTOR,
            phone="+91-9876543213",
            language="en"
        )
        admin = User(
            id=uuid.uuid4(),
            name="System Admin",
            email="admin@ruralclinic.demo",
            password=hashed_pwd,
            role=UserRole.ADMIN,
            phone="+91-9876543214",
            language="en"
        )
        db.add_all([hw1, hw2, dr1, dr2, admin])
        db.flush()

        print("Seeding Patients...")
        p1 = Patient(
            id=uuid.uuid4(),
            patient_code="PAT-000001",
            name="Aarav Verma",
            age=45,
            gender="Male",
            phone="+91-9123456701",
            address="Village Rampur, District Solan, HP",
            preferred_language="hi",
            medical_history=["Hypertension", "Type 2 Diabetes"],
            allergies=["Penicillin"],
            medications=["Metformin 500mg", "Amlodipine 5mg"]
        )
        p2 = Patient(
            id=uuid.uuid4(),
            patient_code="PAT-000002",
            name="Priya Das",
            age=28,
            gender="Female",
            phone="+91-9123456702",
            address="Village Sundarnagar, Mandi, HP",
            preferred_language="hi",
            medical_history=["Asthma"],
            allergies=[],
            medications=["Salbutamol Inhaler"]
        )
        p3 = Patient(
            id=uuid.uuid4(),
            patient_code="PAT-000003",
            name="Chhotu Kumar",
            age=6,
            gender="Male",
            phone="+91-9123456703",
            address="Village Bilaspur, HP",
            preferred_language="hi",
            medical_history=[],
            allergies=["Dust Mites"],
            medications=[]
        )
        p4 = Patient(
            id=uuid.uuid4(),
            patient_code="PAT-000004",
            name="Lakshmi Narayana",
            age=68,
            gender="Male",
            phone="+91-9123456704",
            address="Village Medak, Telangana",
            preferred_language="te",
            medical_history=["Coronary Artery Disease", "Arthritis"],
            allergies=["Sulfa drugs"],
            medications=["Atorvastatin 20mg", "Aspirin 75mg"]
        )
        p5 = Patient(
            id=uuid.uuid4(),
            patient_code="PAT-000005",
            name="Meena Kumari",
            age=34,
            gender="Female",
            phone="+91-9123456705",
            address="Village Hamirpur, HP",
            preferred_language="hi",
            medical_history=["Hypothyroidism"],
            allergies=[],
            medications=["Thyronorm 50mcg"]
        )
        db.add_all([p1, p2, p3, p4, p5])
        db.flush()

        print("Seeding Consultations...")
        c1 = Consultation(
            id=uuid.uuid4(),
            patient_id=p1.id,
            health_worker_id=hw1.id,
            doctor_id=None,
            status=ConsultationStatus.DRAFT,
            chief_complaint="Mild headache and dizziness for 2 days",
            symptoms=[
                {"name": "Headache", "severity": 4, "duration": "2 days"},
                {"name": "Dizziness", "severity": 3, "duration": "1 day"}
            ],
            vitals={
                "temperature": {"value": 98.6, "unit": "F"},
                "blood_pressure": {"systolic": 135, "diastolic": 88, "unit": "mmHg"},
                "pulse": {"value": 78, "unit": "bpm"},
                "spo2": {"value": 98, "unit": "%"}
            },
            voice_transcript="Patient reports feeling lightheaded after working in fields.",
            medical_notes="Initial intake done by HW Ramesh.",
            documents=[],
            images=[]
        )

        c2 = Consultation(
            id=uuid.uuid4(),
            patient_id=p2.id,
            health_worker_id=hw1.id,
            doctor_id=None,
            status=ConsultationStatus.AI_REVIEW_READY,
            chief_complaint="Persistent dry cough and fever for 3 days",
            symptoms=[
                {"name": "Fever", "severity": 7, "duration": "3 days"},
                {"name": "Dry Cough", "severity": 6, "duration": "3 days"},
                {"name": "Shortness of breath", "severity": 5, "duration": "1 day"}
            ],
            vitals={
                "temperature": {"value": 101.4, "unit": "F"},
                "blood_pressure": {"systolic": 120, "diastolic": 80, "unit": "mmHg"},
                "pulse": {"value": 96, "unit": "bpm"},
                "respiratory_rate": {"value": 22, "unit": "breaths/min"},
                "spo2": {"value": 95, "unit": "%"}
            },
            voice_transcript="Coughing increased at night. Known asthmatic.",
            medical_notes="AI analysis requested.",
            documents=[{
                "id": "doc_001",
                "name": "chest_xray_report.pdf",
                "type": "LAB_REPORT",
                "url": "https://storage.clinic.internal/docs/doc_001.pdf",
                "status": "READY_FOR_REVIEW",
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }],
            images=[]
        )

        c3 = Consultation(
            id=uuid.uuid4(),
            patient_id=p3.id,
            health_worker_id=hw2.id,
            doctor_id=None,
            status=ConsultationStatus.AWAITING_DOCTOR,
            chief_complaint="High fever with skin rash on arm",
            symptoms=[
                {"name": "High Fever", "severity": 9, "duration": "2 days"},
                {"name": "Skin Rash", "severity": 7, "duration": "1 day"}
            ],
            vitals={
                "temperature": {"value": 103.1, "unit": "F"},
                "blood_pressure": {"systolic": 100, "diastolic": 65, "unit": "mmHg"},
                "pulse": {"value": 115, "unit": "bpm"},
                "spo2": {"value": 96, "unit": "%"}
            },
            voice_transcript="Child has high fever and red patches appeared on right arm.",
            medical_notes="High priority pediatric request.",
            documents=[],
            images=[{
                "id": "img_001",
                "name": "arm_rash.jpg",
                "url": "https://storage.clinic.internal/img/arm_rash.jpg",
                "analysis_status": "READY_FOR_REVIEW",
                "observations": ["Maculopapular rash visible on forearm"],
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }]
        )

        c4 = Consultation(
            id=uuid.uuid4(),
            patient_id=p4.id,
            health_worker_id=hw2.id,
            doctor_id=dr1.id,
            status=ConsultationStatus.IN_CONSULTATION,
            chief_complaint="Chest discomfort and fatigue",
            symptoms=[
                {"name": "Chest tightness", "severity": 8, "duration": "4 hours"},
                {"name": "Fatigue", "severity": 7, "duration": "2 days"}
            ],
            vitals={
                "temperature": {"value": 98.4, "unit": "F"},
                "blood_pressure": {"systolic": 155, "diastolic": 95, "unit": "mmHg"},
                "pulse": {"value": 92, "unit": "bpm"},
                "spo2": {"value": 94, "unit": "%"}
            },
            voice_transcript="Elderly male experiencing chest heaviness.",
            medical_notes="Doctor Sharma actively reviewing ECG and symptoms.",
            documents=[{
                "id": "doc_002",
                "name": "ecg_strip.pdf",
                "type": "ECG",
                "url": "https://storage.clinic.internal/docs/ecg_strip.pdf",
                "status": "CONFIRMED",
                "uploaded_at": datetime.now(timezone.utc).isoformat()
            }],
            images=[]
        )

        c5 = Consultation(
            id=uuid.uuid4(),
            patient_id=p5.id,
            health_worker_id=hw1.id,
            doctor_id=dr2.id,
            status=ConsultationStatus.COMPLETED,
            chief_complaint="Routine thyroid follow-up and fatigue",
            symptoms=[
                {"name": "Mild fatigue", "severity": 3, "duration": "1 week"}
            ],
            vitals={
                "temperature": {"value": 98.2, "unit": "F"},
                "blood_pressure": {"systolic": 118, "diastolic": 76, "unit": "mmHg"},
                "pulse": {"value": 72, "unit": "bpm"},
                "spo2": {"value": 99, "unit": "%"}
            },
            voice_transcript="Patient reports good compliance with Thyronorm.",
            medical_notes="Thyroid function tests normal. Continue current dosage.",
            documents=[],
            images=[]
        )

        c6 = Consultation(
            id=uuid.uuid4(),
            patient_id=p4.id,
            health_worker_id=hw2.id,
            doctor_id=dr1.id,
            status=ConsultationStatus.REFERRED,
            chief_complaint="Acute severe chest pain radiating to left jaw",
            symptoms=[
                {"name": "Severe chest pain", "severity": 10, "duration": "30 mins"}
            ],
            vitals={
                "temperature": {"value": 98.8, "unit": "F"},
                "blood_pressure": {"systolic": 165, "diastolic": 105, "unit": "mmHg"},
                "pulse": {"value": 110, "unit": "bpm"},
                "spo2": {"value": 91, "unit": "%"}
            },
            voice_transcript="Sudden onset crushing chest pain.",
            medical_notes="Referred immediately to District Cardiology Center.",
            documents=[],
            images=[]
        )

        db.add_all([c1, c2, c3, c4, c5, c6])
        db.flush()

        print("Seeding AI Assessments...")
        a1 = AIAssessment(
            id=uuid.uuid4(),
            consultation_id=c1.id,
            summary="Symptoms appear consistent with mild dehydration or tension headache.",
            observations=["Mild elevated blood pressure", "Dizziness reported"],
            missing_information=["Water intake history needs confirmation"],
            risk_level=RiskLevel.LOW,
            risk_reason="Vitals mostly within acceptable ranges, mild symptoms.",
            recommendation="Hydration and rest advised. Monitor blood pressure.",
            confidence=0.88,
            model_name="mock-triage-ai-v1",
            status=AIAssessmentStatus.COMPLETED
        )

        a2 = AIAssessment(
            id=uuid.uuid4(),
            consultation_id=c2.id,
            summary="Possible lower respiratory tract infection or asthma exacerbation.",
            observations=["Fever 101.4F", "Elevated respiratory rate (22 bpm)", "History of Asthma"],
            missing_information=["Peak flow measurement not available"],
            risk_level=RiskLevel.MODERATE,
            risk_reason="Moderate fever with respiratory symptoms in known asthmatic.",
            recommendation="Remote physician review recommended within 24 hours.",
            confidence=0.85,
            model_name="mock-triage-ai-v1",
            status=AIAssessmentStatus.COMPLETED
        )

        a3 = AIAssessment(
            id=uuid.uuid4(),
            consultation_id=c3.id,
            summary="Pediatric acute febrile illness with cutaneous manifestations.",
            observations=["High fever 103.1F in 6-year-old child", "Rapid heart rate (115 bpm)", "Rash on right arm"],
            missing_information=["Vaccination history confirmation required"],
            risk_level=RiskLevel.HIGH,
            risk_reason="High fever and rash in pediatric patient require prompt evaluation.",
            recommendation="Urgent doctor consultation required.",
            confidence=0.91,
            model_name="mock-triage-ai-v1",
            status=AIAssessmentStatus.COMPLETED
        )

        a4 = AIAssessment(
            id=uuid.uuid4(),
            consultation_id=c6.id,
            summary="High likelihood of Acute Coronary Syndrome (ACS).",
            observations=["Severe chest pain 10/10", "Radiation to jaw", "Hypoxia SpO2 91%", "Hypertensive emergency"],
            missing_information=[],
            risk_level=RiskLevel.IMMEDIATE,
            risk_reason="Critical cardiac symptoms with desaturation requiring emergency hospital transfer.",
            recommendation="Immediate professional cardiac evaluation and emergency transport.",
            confidence=0.96,
            model_name="mock-triage-ai-v1",
            status=AIAssessmentStatus.COMPLETED
        )

        db.add_all([a1, a2, a3, a4])
        db.flush()

        print("Seeding Doctor Requests...")
        r1 = DoctorRequest(
            id=uuid.uuid4(),
            consultation_id=c3.id,
            patient_id=p3.id,
            doctor_id=dr2.id,
            requested_by=hw2.id,
            priority=RiskLevel.HIGH,
            reason="6-year-old child presenting with 103.1F fever and spreading rash.",
            status=DoctorRequestStatus.REQUESTED,
            doctor_notes=None,
            instructions=None,
            referral=None
        )

        r2 = DoctorRequest(
            id=uuid.uuid4(),
            consultation_id=c4.id,
            patient_id=p4.id,
            doctor_id=dr1.id,
            requested_by=hw2.id,
            priority=RiskLevel.HIGH,
            reason="68-year-old male with history of CAD reporting chest tightness.",
            status=DoctorRequestStatus.IN_CONSULTATION,
            doctor_notes="Administer oxygen if SpO2 drops below 93%. Reviewing ECG now.",
            instructions="Keep patient resting in semi-Fowler position.",
            referral=None
        )

        r3 = DoctorRequest(
            id=uuid.uuid4(),
            consultation_id=c5.id,
            patient_id=p5.id,
            doctor_id=dr2.id,
            requested_by=hw1.id,
            priority=RiskLevel.LOW,
            reason="Routine thyroid follow-up consultation.",
            status=DoctorRequestStatus.COMPLETED,
            doctor_notes="Thyroid levels stable. Patient doing well.",
            instructions="Continue Thyronorm 50mcg daily.",
            referral=None
        )

        r4 = DoctorRequest(
            id=uuid.uuid4(),
            consultation_id=c6.id,
            patient_id=p4.id,
            doctor_id=dr1.id,
            requested_by=hw2.id,
            priority=RiskLevel.IMMEDIATE,
            reason="Acute crushing chest pain with desaturation (SpO2 91%).",
            status=DoctorRequestStatus.REFERRED,
            doctor_notes="Suspected STEMI/ACS. Dispatched 108 emergency ambulance.",
            instructions="Administer Aspirin 325mg stat if not contraindicated.",
            referral={
                "required": True,
                "destination": "District Hospital Cardiac ICU",
                "reason": "Suspected acute myocardial infarction requiring urgent catheterization."
            }
        )

        db.add_all([r1, r2, r3, r4])
        db.flush()

        print("Seeding Notifications...")
        n1 = Notification(
            id=uuid.uuid4(),
            user_id=dr2.id,
            title="High Priority Consultation Request",
            message="Health Worker Sunita requested urgent review for patient Chhotu Kumar (PAT-000003).",
            type=NotificationType.DOCTOR_REQUEST,
            is_read=False,
            related_entity_id=r1.id
        )

        n2 = Notification(
            id=uuid.uuid4(),
            user_id=hw2.id,
            title="Doctor Consultation Accepted",
            message="Dr. Ananya Sharma accepted consultation for patient Lakshmi Narayana (PAT-000004).",
            type=NotificationType.CONSULTATION_UPDATE,
            is_read=True,
            related_entity_id=c4.id
        )

        n3 = Notification(
            id=uuid.uuid4(),
            user_id=hw1.id,
            title="AI Assessment Complete",
            message="AI Triage generated LOW risk assessment for Aarav Verma (PAT-000001).",
            type=NotificationType.AI_ANALYSIS,
            is_read=True,
            related_entity_id=c2.id
        )

        n4 = Notification(
            id=uuid.uuid4(),
            user_id=hw1.id,
            title="Immediate Referral Alert",
            message="Urgent specialist referral created for Ramesh Patel (PAT-000002).",
            type=NotificationType.WARNING,
            is_read=False,
            related_entity_id=r4.id
        )

        db.add_all([n1, n2, n3, n4])
        db.commit()

        print("[SUCCESS] Database seeding completed successfully!")
        print("Summary of Seeded Data:")
        print(f" - Users: {db.query(User).count()}")
        print(f" - Patients: {db.query(Patient).count()}")
        print(f" - Consultations: {db.query(Consultation).count()}")
        print(f" - AI Assessments: {db.query(AIAssessment).count()}")
        print(f" - Doctor Requests: {db.query(DoctorRequest).count()}")
        print(f" - Notifications: {db.query(Notification).count()}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed with error: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
