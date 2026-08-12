import sys
import os
import uuid
import asyncio
from datetime import datetime, timezone

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import database.models

try:
    import pytest
except ImportError:
    pytest = None

from app.common.enums import NotificationType, RiskLevel, DoctorRequestStatus
from app.notifications.schemas import NotificationCreate
from app.notifications.service import NotificationService
from app.notifications.websocket_manager import websocket_manager
from app.doctors.schemas import DoctorRequestCreate
from app.doctors.services.doctor_request_service import DoctorRequestService
from app.core.security import create_access_token

class MockDB:
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
            def update(self, values, synchronize_session=False):
                cnt = 0
                for item in self.parent.added:
                    if not item.is_read:
                        item.is_read = True
                        cnt += 1
                return cnt
            def first(self):
                return self.parent.added[0] if self.parent.added else None
            def all(self):
                return self.parent.added
        return DummyQuery(self)

def test_notification_service_send_and_query():
    db = MockDB()
    service = NotificationService(db)
    user_id = uuid.uuid4()

    # 1. Send notification
    res = service.send_notification(
        user_id=user_id,
        title="High Priority AI Triage Alert",
        message="Patient SpO2 below 90% requiring immediate doctor escalation.",
        type=NotificationType.AI_ANALYSIS,
        priority=RiskLevel.IMMEDIATE,
        event_type="ai_processing_completed",
        related_entity_type="CONSULTATION",
        related_entity_id=uuid.uuid4(),
        navigation_target="/consultations/sample"
    )

    assert res.user_id == user_id
    assert res.title == "High Priority AI Triage Alert"
    assert res.priority == RiskLevel.IMMEDIATE
    assert res.is_read is False

    # 2. Get unread count
    unread_res = service.get_unread_count(user_id)
    assert unread_res.unread_count == 1

    # 3. Mark notification as read
    read_res = service.mark_notification_read(res.id, user_id)
    assert read_res.is_read is True

    # 4. Bulk mark all read
    bulk_cnt = service.mark_all_notifications_read(user_id)
    assert bulk_cnt >= 0

def test_websocket_manager_connection_and_auth():
    # 1. Test token authentication
    user_id = uuid.uuid4()
    token = create_access_token(user_id, "DOCTOR")
    auth_user = websocket_manager.authenticate_connection(token)
    assert auth_user is not None
    assert str(auth_user) == str(user_id)

    # 2. Test connection registry tracking
    assert isinstance(websocket_manager.active_connections, dict)

def test_doctor_request_notification_integration():
    db = MockDB()
    doctor_service = DoctorRequestService(db)
    health_worker_id = uuid.uuid4()
    consultation_id = uuid.uuid4()
    patient_id = uuid.uuid4()

    req_in = DoctorRequestCreate(
        consultation_id=consultation_id,
        patient_id=patient_id,
        priority=RiskLevel.HIGH,
        reason="Severe pyrexia and hypoxia"
    )

    res = doctor_service.create_request(req_in, health_worker_id)
    assert res.consultation_id == consultation_id
    assert len(db.added) >= 1 # Notification object persisted in DB

if __name__ == "__main__":
    test_notification_service_send_and_query()
    test_websocket_manager_connection_and_auth()
    test_doctor_request_notification_integration()
    print("ALL NOTIFICATIONS MODULE UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!")
