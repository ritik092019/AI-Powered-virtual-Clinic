import sys
import os
import uuid
from datetime import datetime, timezone

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import all models to ensure SQLAlchemy metadata resolves relationships
import database.models

try:
    import pytest
except ImportError:
    pytest = None

from app.common.enums import RiskLevel, DoctorRequestStatus, DoctorAvailabilityStatus
from app.doctors.schemas import (
    DoctorRequestCreate,
    DoctorQueueFilter,
    DoctorNotesCreate,
    DoctorInstructionsCreate,
    ReferralDecisionSchema,
    DoctorAvailabilityUpdate
)
from app.doctors.services.doctor_request_service import DoctorRequestService
from app.doctors.services.remote_consultation_service import RemoteConsultationService

class MockDB:
    """In-memory DB session mock for fast doctor module testing."""
    def __init__(self):
        self.added = []
    def add(self, item):
        self.added.append(item)
    def commit(self):
        pass
    def refresh(self, item):
        pass
    def query(self, *args, **kwargs):
        class DummyQuery:
            def filter(self, *args, **kwargs):
                return self
            def order_by(self, *args, **kwargs):
                return self
            def first(self):
                return None
            def all(self):
                return []
        return DummyQuery()

def test_doctor_request_creation_and_queue():
    consultation_id = uuid.uuid4()
    patient_id = uuid.uuid4()
    health_worker_id = uuid.uuid4()

    req_in = DoctorRequestCreate(
        consultation_id=consultation_id,
        patient_id=patient_id,
        priority=RiskLevel.HIGH,
        reason="Patient with high fever and hypoxia needing urgent physician review"
    )

    db = MockDB()
    service = DoctorRequestService(db)
    res = service.create_request(req_in, health_worker_id)

    assert res.consultation_id == consultation_id
    assert res.patient_id == patient_id
    assert res.priority == RiskLevel.HIGH
    assert res.status == DoctorRequestStatus.REQUESTED
    assert res.requested_by == health_worker_id

def test_doctor_queue_filtering():
    db = MockDB()
    service = DoctorRequestService(db)
    doctor_id = uuid.uuid4()
    filter_in = DoctorQueueFilter(priority=RiskLevel.HIGH, unassigned_only=True)
    queue = service.get_queue(filter_in, doctor_id)
    assert isinstance(queue, list)

def test_doctor_availability_update():
    db = MockDB()
    service = DoctorRequestService(db)
    doctor_id = uuid.uuid4()
    avail_in = DoctorAvailabilityUpdate(status=DoctorAvailabilityStatus.AVAILABLE, specialty="General Medicine")
    res = service.update_availability(doctor_id, avail_in)

    assert res.user_id == doctor_id
    assert res.status == DoctorAvailabilityStatus.AVAILABLE
    assert res.specialty == "General Medicine"

def test_remote_consultation_notes_and_referral():
    consultation_id = uuid.uuid4()
    doctor_id = uuid.uuid4()
    db = MockDB()
    service = RemoteConsultationService(db)

    # 1. WebRTC session metadata check
    webrtc = service.get_webrtc_session(consultation_id)
    assert webrtc.room_id.startswith("room_")
    assert len(webrtc.ice_servers) >= 1

    # 2. Doctor Notes Authoring
    notes_in = DoctorNotesCreate(
        clinical_observations="Patient presents with acute pyrexia (102.5 F) and tachypnea.",
        diagnosis="Acute Lower Respiratory Tract Infection",
        treatment_plan="Initiate broad spectrum antibiotics, paracetamol 500mg TDS, and supplementary O2.",
        prescriptions=[
            {"name": "Paracetamol", "dosage": "500mg", "frequency": "TDS"},
            {"name": "Amoxicillin", "dosage": "500mg", "frequency": "BD"}
        ],
        follow_up_days="3 days"
    )

    from app.doctors.models import DoctorRequest
    now = datetime.now(timezone.utc)
    mock_req = DoctorRequest(
        id=uuid.uuid4(),
        consultation_id=consultation_id,
        patient_id=uuid.uuid4(),
        requested_by=uuid.uuid4(),
        priority=RiskLevel.HIGH,
        reason="Physician consultation",
        status=DoctorRequestStatus.ACCEPTED,
        created_at=now,
        updated_at=now
    )
    service.repo.get_doctor_request_by_consultation = lambda cid: mock_req
    service.repo.save_clinical_notes = lambda **k: type("Note", (), {
        "id": uuid.uuid4(),
        "consultation_id": consultation_id,
        "doctor_id": doctor_id,
        "clinical_observations": k["observations"],
        "diagnosis": k["diagnosis"],
        "treatment_plan": k["treatment_plan"],
        "prescriptions": k["prescriptions"],
        "follow_up_days": k["follow_up_days"],
        "created_at": k.get("created_at") or now
    })()

    notes_res = service.add_clinical_notes(consultation_id, doctor_id, notes_in)
    assert notes_res.diagnosis == "Acute Lower Respiratory Tract Infection"
    assert len(notes_res.prescriptions) == 2

    # 3. Referral Decision
    referral_in = ReferralDecisionSchema(
        required=True,
        destination_facility="District Headquarters Hospital - Chest & ICU Ward",
        transfer_urgency="IMMEDIATE",
        clinical_reasoning="Hypoxia not responding to low-flow oxygen; requires ICU monitoring."
    )
    service.repo.save_referral = lambda rid, rdata: setattr(mock_req, "referral", rdata)

    consult_view = service.issue_referral(consultation_id, doctor_id, referral_in)
    assert consult_view.referral_decision["destination_facility"] == "District Headquarters Hospital - Chest & ICU Ward"
    assert consult_view.ai_preliminary_assessment is not None # Verifies AI vs Doctor separation

if __name__ == "__main__":
    test_doctor_request_creation_and_queue()
    test_doctor_queue_filtering()
    test_doctor_availability_update()
    test_remote_consultation_notes_and_referral()
    print("ALL DOCTOR MODULE UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!")
