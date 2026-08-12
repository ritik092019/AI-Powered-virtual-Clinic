import sys
import os
import uuid
# Pytest optional

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import database.models  # noqa: F401 - side effect: registers mappers

from app.common.enums import UserRole, DoctorAvailabilityStatus
from app.common.exceptions import ForbiddenException, NotFoundException, BadRequestException
from app.admin.schemas import (
    DoctorSpecialistCreate,
    DoctorSpecialistUpdate,
    DoctorStatusUpdate
)
from app.admin.services.doctor_management_service import DoctorManagementService

class _FakeQuery:
    def __init__(self, items_store: dict):
        self._store = items_store
        self._model = None
        self._filters = []

    def filter(self, *args, **kwargs):
        self._filters.extend(args)
        return self

    def order_by(self, *args, **kwargs):
        return self

    def offset(self, n):
        return self

    def limit(self, n):
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
        import uuid as _uuid
        from datetime import datetime, timezone as _tz
        _now = datetime.now(_tz.utc)
        if not getattr(item, "id", None):
            item.id = _uuid.uuid4()
        if not getattr(item, "created_at", None):
            item.created_at = _now
        if not getattr(item, "updated_at", None):
            item.updated_at = _now

    def query(self, model):
        q = _FakeQuery(self._store)
        q._model = model.__name__ if hasattr(model, "__name__") else str(model)
        return q


def test_doctor_specialist_creation():
    db = MockDB()
    service = DoctorManagementService(db)
    admin_id = uuid.uuid4()

    doc_in = DoctorSpecialistCreate(
        name="Dr. Ananya Rao",
        email="ananya.rao@clinic.org",
        password="SecurePass2026!",
        phone="+91-9876543211",
        specialization="Cardiology",
        qualifications="MBBS, MD (Cardiology), DM",
        experience_years=12,
        license_number="MCI-48921",
        address="Apollo Tele-Center, Jubilee Hills",
        city_state="Hyderabad, Telangana",
        languages=["English", "Telugu", "Hindi"],
        availability_status=DoctorAvailabilityStatus.AVAILABLE,
        is_active=True
    )

    created = service.create_doctor(doc_in, admin_id=admin_id)

    assert created.id is not None
    assert created.name == "Dr. Ananya Rao"
    assert created.email == "ananya.rao@clinic.org"
    assert created.specialization == "Cardiology"
    assert created.qualifications == "MBBS, MD (Cardiology), DM"
    assert created.experience_years == 12
    assert created.license_number == "MCI-48921"
    assert created.role == UserRole.DOCTOR
    assert created.is_active is True
    assert "Telugu" in created.languages
    print("\n  [PASS] Doctor Specialist Creation Test")


def test_doctor_specialist_listing_and_filtering():
    db = MockDB()
    service = DoctorManagementService(db)
    admin_id = uuid.uuid4()

    # Create 2 doctors
    doc1 = DoctorSpecialistCreate(
        name="Dr. Rajesh Verma",
        email="rajesh.verma@clinic.org",
        password="Pass123!",
        phone="+91-9000000001",
        specialization="Pediatrics",
        qualifications="MBBS, DCH",
        experience_years=8,
        license_number="MCI-10001",
        address="District Hospital",
        city_state="Surguja, Chhattisgarh",
        languages=["Hindi", "English"],
        availability_status=DoctorAvailabilityStatus.AVAILABLE,
        is_active=True
    )
    doc2 = DoctorSpecialistCreate(
        name="Dr. Sunita Sharma",
        email="sunita.sharma@clinic.org",
        password="Pass123!",
        phone="+91-9000000002",
        specialization="Dermatology",
        qualifications="MBBS, MD (Derm)",
        experience_years=15,
        license_number="MCI-10002",
        address="Skin Care Clinic",
        city_state="Raipur, Chhattisgarh",
        languages=["Hindi"],
        availability_status=DoctorAvailabilityStatus.BUSY,
        is_active=False
    )

    service.create_doctor(doc1, admin_id)
    service.create_doctor(doc2, admin_id)

    # Test List All
    res_all = service.list_doctors()
    assert res_all.total == 2

    # Test Search by Name
    res_search = service.list_doctors(search="Sunita")
    assert res_search.total == 1
    assert res_search.doctors[0].name == "Dr. Sunita Sharma"

    # Test Filter by Specialty
    res_ped = service.list_doctors(specialization="Pediatrics")
    assert res_ped.total == 1
    assert res_ped.doctors[0].specialization == "Pediatrics"

    # Test Filter by Active Status
    res_active = service.list_doctors(is_active=True)
    assert res_active.total == 1
    assert res_active.doctors[0].name == "Dr. Rajesh Verma"

    print("  [PASS] Doctor Specialist Listing, Searching & Filtering Test")


def test_doctor_specialist_update_and_status_toggle():
    db = MockDB()
    service = DoctorManagementService(db)
    admin_id = uuid.uuid4()

    doc_in = DoctorSpecialistCreate(
        name="Dr. Vikram Patel",
        email="vikram.patel@clinic.org",
        password="Pass123!",
        phone="+91-9000000003",
        specialization="General Medicine",
        qualifications="MBBS",
        experience_years=5,
        license_number="MCI-30003",
        address="CHC Center",
        city_state="Bhilai, Chhattisgarh",
        languages=["Hindi"],
        availability_status=DoctorAvailabilityStatus.AVAILABLE,
        is_active=True
    )

    created = service.create_doctor(doc_in, admin_id)

    # Update qualifications & experience
    update_in = DoctorSpecialistUpdate(
        qualifications="MBBS, MD (Internal Medicine)",
        experience_years=7,
        specialization="Internal Medicine"
    )
    updated = service.update_doctor(created.id, update_in, admin_id)

    assert updated.qualifications == "MBBS, MD (Internal Medicine)"
    assert updated.experience_years == 7
    assert updated.specialization == "Internal Medicine"

    # Toggle Status to Deactivated
    toggled = service.toggle_doctor_status(created.id, DoctorStatusUpdate(is_active=False), admin_id)
    assert toggled.is_active is False

    # Toggle Status back to Active
    toggled_back = service.toggle_doctor_status(created.id, DoctorStatusUpdate(is_active=True), admin_id)
    assert toggled_back.is_active is True

    print("  [PASS] Doctor Specialist Update & Status Toggle Test")


def test_rbac_admin_guard():
    from app.core.dependencies import require_admin
    from app.users.models import User as UserModel

    admin_user = UserModel(id=uuid.uuid4(), role=UserRole.ADMIN, name="Admin User", email="admin@clinic.org")
    doctor_user = UserModel(id=uuid.uuid4(), role=UserRole.DOCTOR, name="Dr. Doctor", email="doc@clinic.org")
    hw_user = UserModel(id=uuid.uuid4(), role=UserRole.HEALTH_WORKER, name="HW Ramu", email="hw@clinic.org")

    assert require_admin(admin_user).role == UserRole.ADMIN

    for non_admin in [doctor_user, hw_user]:
        try:
            require_admin(non_admin)
            assert False, f"require_admin must reject {non_admin.role}"
        except ForbiddenException:
            pass

    print("  [PASS] Doctor Management RBAC Admin Guard Test")


if __name__ == "__main__":
    print("=====================================================")
    print("RUNNING DOCTOR SPECIALIST MANAGEMENT MODULE TESTS")
    print("=====================================================")
    test_doctor_specialist_creation()
    test_doctor_specialist_listing_and_filtering()
    test_doctor_specialist_update_and_status_toggle()
    test_rbac_admin_guard()
    print("=====================================================")
    print("ALL DOCTOR SPECIALIST MANAGEMENT TESTS PASSED!")
    print("=====================================================")
