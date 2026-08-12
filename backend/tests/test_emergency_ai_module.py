import sys
import os
import uuid

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import database.models  # noqa: F401

from app.ai.schemas import EmergencyAssessmentRequest
from app.ai.services.emergency_ai_service import EmergencyAIService
from app.users.models import User
from app.common.enums import UserRole

class _FakeQuery:
    def __init__(self, items_store: dict):
        self._store = items_store
        self._model = None
        self._filters = []

    def filter(self, *args, **kwargs):
        self._filters.extend(args)
        return self

    def _get_matching_items(self):
        if not self._model or self._model not in self._store:
            return []
        items = list(self._store[self._model])
        for crit in self._filters:
            if hasattr(crit, "left") and hasattr(crit, "right"):
                col_name = getattr(crit.left, "name", None)
                right = crit.right
                target_val = getattr(right, "value", right)
                if col_name is not None and target_val is not None:
                    items = [it for it in items if getattr(it, col_name, None) == target_val]
        return items

    def count(self):
        return len(self._get_matching_items())

    def first(self):
        items = self._get_matching_items()
        return items[0] if items else None

    def all(self):
        return self._get_matching_items()

    def __call__(self, model):
        self._model = model.__name__ if hasattr(model, "__name__") else str(model)
        self._filters = []
        return self

class MockDB:
    def __init__(self):
        self._store: dict = {}

    def add(self, item):
        name = item.__class__.__name__
        if name not in self._store:
            self._store[name] = []
        self._store[name].append(item)

    def commit(self):
        pass

    def refresh(self, item):
        if not getattr(item, "id", None):
            item.id = uuid.uuid4()

    def query(self, model):
        q = _FakeQuery(self._store)
        q._model = model.__name__ if hasattr(model, "__name__") else str(model)
        return q


def test_emergency_assessment_critical_with_high_alert():
    db = MockDB()

    # Add a mock doctor user to receive High Alert notifications
    doc_user = User(
        id=uuid.uuid4(),
        name="Dr. Emergency Telemedicine",
        email="doctor.emergency@clinic.org",
        role=UserRole.DOCTOR,
        is_active=True
    )
    db.add(doc_user)

    service = EmergencyAIService(db)

    req = EmergencyAssessmentRequest(
        image_base64="data:image/jpeg;base64,mock_photo_bytes_representation",
        age=54,
        symptoms=["Chest Pain", "Breathlessness", "Severe Bleeding"],
        vitals={"spo2": 88, "bp_systolic": 165},
        injury_description="Patient collapsed with acute crushing chest pain and profuse leg wound bleeding",
        high_alert_toggled=True
    )

    resp = service.process_emergency_assessment(req)

    assert resp.id is not None
    assert resp.urgency_level == "CRITICAL_EMERGENCY"
    assert resp.doctor_escalation_required is True
    assert len(resp.immediate_first_aid) >= 2
    assert len(resp.critical_warnings) >= 1
    assert resp.high_alert_sent is True
    print("\n  [PASS] Critical Emergency Assessment with High-Alert Notification Test")


def test_emergency_assessment_high_priority_burn():
    db = MockDB()
    service = EmergencyAIService(db)

    req = EmergencyAssessmentRequest(
        image_base64="data:image/png;base64,burn_photo",
        age=28,
        symptoms=["Burn"],
        vitals={"spo2": 97, "bp_systolic": 120},
        injury_description="Boiling water burn on forearm",
        high_alert_toggled=False
    )

    resp = service.process_emergency_assessment(req)

    assert resp.urgency_level == "HIGH_PRIORITY"
    assert resp.doctor_escalation_required is True
    assert any("cool running water" in step.lower() for step in resp.immediate_first_aid)
    assert any("do not apply ice" in warn.lower() for warn in resp.critical_warnings)
    print("  [PASS] High-Priority Burn Emergency Assessment Test")


def test_emergency_assessment_moderate():
    db = MockDB()
    service = EmergencyAIService(db)

    req = EmergencyAssessmentRequest(
        age=35,
        symptoms=["Mild Sprain"],
        vitals={"spo2": 98, "bp_systolic": 118},
        injury_description="Twisted ankle while walking",
        high_alert_toggled=False
    )

    resp = service.process_emergency_assessment(req)

    assert resp.urgency_level == "MODERATE_URGENT"
    assert len(resp.immediate_first_aid) >= 1
    print("  [PASS] Moderate Emergency Assessment Test")


if __name__ == "__main__":
    print("=====================================================")
    print("RUNNING EMERGENCY GEMINI AI ASSESSMENT MODULE TESTS")
    print("=====================================================")
    test_emergency_assessment_critical_with_high_alert()
    test_emergency_assessment_high_priority_burn()
    test_emergency_assessment_moderate()
    print("=====================================================")
    print("ALL EMERGENCY GEMINI AI ASSESSMENT TESTS PASSED!")
    print("=====================================================")
