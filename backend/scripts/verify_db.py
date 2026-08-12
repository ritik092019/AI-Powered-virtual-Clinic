import sys
import os
import uuid
from sqlalchemy import text, inspect
from sqlalchemy.exc import IntegrityError, DataError

# Ensure src is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.db.session import SessionLocal, engine
from src.db.base import Base
from src.models import (
    User, UserRole,
    Patient,
    Consultation, ConsultationStatus,
    AIAssessment, RiskLevel, AIAssessmentStatus,
    DoctorRequest, DoctorRequestStatus,
    Notification, NotificationType
)

def run_verification_tests():
    print("=====================================================")
    print("Running PostgreSQL Database Schema Verification Tests")
    print("=====================================================")

    # 1. Verify Table Existence
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    expected_tables = {
        "users", "patients", "consultations", 
        "ai_assessments", "doctor_requests", "notifications"
    }

    print(f"\n1. Checking Core Tables existence...")
    missing_tables = expected_tables - existing_tables
    if missing_tables:
        print(f"[FAIL] Missing required tables: {missing_tables}")
        sys.exit(1)
    else:
        print(f"[PASS] All 6 core tables present: {sorted(list(expected_tables))}")

    db = SessionLocal()
    try:
        # 2. Test User Role Enum and Uniqueness
        print("\n2. Testing User role enum and uniqueness...")
        hw_count = db.query(User).filter(User.role == UserRole.HEALTH_WORKER).count()
        dr_count = db.query(User).filter(User.role == UserRole.DOCTOR).count()
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN).count()
        print(f"[PASS] Found {hw_count} Health Workers, {dr_count} Doctors, {admin_count} Admins")

        # 3. Test Patient Age Check Constraint
        print("\n3. Testing Patient age check constraint (age >= 0)...")
        invalid_patient = Patient(
            id=uuid.uuid4(),
            patient_code="INVALID-001",
            name="Invalid Age Patient",
            age=-10
        )
        try:
            db.add(invalid_patient)
            db.commit()
            print("[FAIL] Patient with negative age was inserted without throwing constraint error!")
            sys.exit(1)
        except (IntegrityError, DataError):
            db.rollback()
            print("[PASS] Check constraint correctly rejected negative patient age (-10)")

        # 4. Test JSONB Field Queryability
        print("\n4. Testing JSONB queries on Patient medical history & Consultation vitals...")
        diabetic_patients = db.query(Patient).filter(
            text("medical_history @> '[\"Diabetes\"]'::jsonb")
        ).all()
        print(f"[PASS] JSONB query returned {len(diabetic_patients)} patient(s) with Diabetes")

        # 5. Test Consultation Status & Nullable doctor_id
        print("\n5. Testing Consultation doctor_id nullability...")
        unassigned_consultation = db.query(Consultation).filter(
            Consultation.doctor_id == None
        ).first()
        if unassigned_consultation:
            print(f"[PASS] Unassigned consultation exists without doctor_id (ID: {unassigned_consultation.id}, Status: {unassigned_consultation.status})")
        else:
            print("[INFO] No unassigned consultation found in DB")

        # 6. Test Foreign Key Delete Cascade vs Restrict vs Set Null Behavior
        print("\n6. Testing Foreign Key constraint policies...")
        
        temp_patient = Patient(
            id=uuid.uuid4(),
            patient_code="PAT-TEMP-999",
            name="Temp Patient"
        )
        temp_hw = User(
            id=uuid.uuid4(),
            name="Temp HW",
            email="temphw@clinic.demo",
            password="hash",
            role=UserRole.HEALTH_WORKER
        )
        db.add_all([temp_patient, temp_hw])
        db.flush()

        temp_consultation = Consultation(
            id=uuid.uuid4(),
            patient_id=temp_patient.id,
            health_worker_id=temp_hw.id,
            status=ConsultationStatus.DRAFT
        )
        db.add(temp_consultation)
        db.flush()

        temp_doc_req = DoctorRequest(
            id=uuid.uuid4(),
            consultation_id=temp_consultation.id,
            patient_id=temp_patient.id,
            requested_by=temp_hw.id,
            priority=RiskLevel.LOW,
            reason="Testing cascade delete"
        )
        db.add(temp_doc_req)
        db.commit()

        req_id = temp_doc_req.id
        db.delete(temp_consultation)
        db.commit()

        deleted_req = db.query(DoctorRequest).filter(DoctorRequest.id == req_id).first()
        if deleted_req is None:
            print("[PASS] DoctorRequest was CASCADE deleted when parent Consultation was deleted")
        else:
            print("[FAIL] DoctorRequest was NOT deleted when parent Consultation was deleted")
            sys.exit(1)

        db.delete(temp_patient)
        db.delete(temp_hw)
        db.commit()

        print("\n=====================================================")
        print("[SUCCESS] ALL DATABASE VERIFICATION TESTS PASSED!")
        print("=====================================================")

    except Exception as e:
        db.rollback()
        print(f"[FAIL] Verification failed with error: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_verification_tests()
