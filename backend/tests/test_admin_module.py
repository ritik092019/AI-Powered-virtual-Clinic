import sys
import os
import uuid

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import database.models

try:
    import pytest
except ImportError:
    pytest = None

from app.common.enums import UserRole
from app.common.exceptions import ForbiddenException
from app.core.dependencies import require_admin
from app.users.models import User
from app.admin.schemas import (
    AdminUserCreate,
    AdminUserStatusUpdate,
    ClinicalProtocolCreate
)
from app.admin.service import AdminService

class MockDB:
    def __init__(self):
        self.added = []
    def add(self, item):
        self.added.append(item)
    def commit(self):
        pass
    def refresh(self, item):
        pass
    def execute(self, *args, **kwargs):
        return True
    def query(self, *args, **kwargs):
        class DummyQuery:
            def __init__(self, parent):
                self.parent = parent
            def filter(self, *args, **kwargs):
                return self
            def order_by(self, *args, **kwargs):
                return self
            def offset(self, *args, **kwargs):
                return self
            def limit(self, *args, **kwargs):
                return self
            def count(self):
                return len(self.parent.added)
            def first(self):
                return self.parent.added[0] if self.parent.added else None
            def all(self):
                return self.parent.added
        return DummyQuery(self)

def test_admin_user_creation_and_status_update():
    db = MockDB()
    service = AdminService(db)
    admin_id = uuid.uuid4()

    # 1. Create user account
    user_in = AdminUserCreate(
        name="Dr. Rural Specialist",
        email=f"specialist_{uuid.uuid4().hex[:6]}@clinic.org",
        role=UserRole.DOCTOR,
        password="SecureAdminPassword123!",
        phone="+91-9876543210"
    )
    user_res = service.create_user(user_in, admin_id)
    assert user_res.name == "Dr. Rural Specialist"
    assert user_res.role == UserRole.DOCTOR
    assert user_res.is_active is True

    # 2. Update status (Deactivate user)
    updated_res = service.update_user_status(user_res.id, AdminUserStatusUpdate(is_active=False), admin_id)
    assert updated_res.is_active is False

def test_admin_platform_metrics_and_system_status():
    db = MockDB()
    service = AdminService(db)

    # 1. Platform Statistics
    stats = service.get_platform_stats()
    assert hasattr(stats, "total_patients")
    assert hasattr(stats, "total_consultations")
    assert hasattr(stats, "active_doctors")

    # 2. System Status Monitoring (Sans Secret Leakage)
    sys_status = service.get_system_status()
    assert sys_status.overall_status in ("ONLINE", "DEGRADED")
    assert len(sys_status.components) >= 4

    # Verify no credentials or secret keys are exposed
    for c in sys_status.components:
        details_lower = (c.details or "").lower()
        assert "password" not in details_lower
        assert "secret" not in details_lower
        assert "token" not in details_lower

def test_admin_clinical_protocol_management():
    db = MockDB()
    service = AdminService(db)
    admin_id = uuid.uuid4()

    proto_in = ClinicalProtocolCreate(
        title="Severe Malnutrition & Pediatric Triage Protocol",
        version="v2.0",
        category="TRIAGE",
        threshold_rules={"muac_cm": 11.5, "edema_present": True},
        guidelines_summary="Severe acute malnutrition requires immediate therapeutic feeding referral."
    )
    res = service.create_protocol(proto_in, admin_id)
    assert res.title == "Severe Malnutrition & Pediatric Triage Protocol"
    assert res.version == "v2.0"

    protocols_list = service.list_protocols()
    assert len(protocols_list) >= 3

def test_admin_audit_log_visibility():
    db = MockDB()
    service = AdminService(db)
    audit_res = service.get_audit_logs(limit=10)
    assert audit_res.total >= 1
    assert len(audit_res.logs) >= 1

def test_admin_rbac_authorization_guard():
    admin_user = User(id=uuid.uuid4(), role=UserRole.ADMIN, name="Admin")
    doctor_user = User(id=uuid.uuid4(), role=UserRole.DOCTOR, name="Doctor")
    worker_user = User(id=uuid.uuid4(), role=UserRole.HEALTH_WORKER, name="Worker")

    # Admin access check
    auth_admin = require_admin(admin_user)
    assert auth_admin.role == UserRole.ADMIN

    # Non-admin access check
    try:
        require_admin(doctor_user)
        assert False, "Should have raised ForbiddenException"
    except ForbiddenException:
        pass

    try:
        require_admin(worker_user)
        assert False, "Should have raised ForbiddenException"
    except ForbiddenException:
        pass

if __name__ == "__main__":
    test_admin_user_creation_and_status_update()
    test_admin_platform_metrics_and_system_status()
    test_admin_clinical_protocol_management()
    test_admin_audit_log_visibility()
    test_admin_rbac_authorization_guard()
    print("ALL ADMIN MODULE UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!")
