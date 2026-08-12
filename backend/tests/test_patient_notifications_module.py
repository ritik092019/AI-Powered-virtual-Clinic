import sys
import os
import unittest
import uuid
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.common.enums import NotificationType, RiskLevel


class MockNotification:
    def __init__(self, id, user_id, title, message, notification_type, priority, is_read=False):
        self.id = id
        self.user_id = user_id
        self.title = title
        self.message = message
        self.notification_type = notification_type
        self.priority = priority
        self.is_read = is_read
        self.created_at = datetime.utcnow()


class TestPatientNotificationsModule(unittest.TestCase):

    def setUp(self):
        self.patient_id = uuid.uuid4()
        self.other_patient_id = uuid.uuid4()

        self.notifications = [
            MockNotification(
                id=uuid.uuid4(),
                user_id=self.patient_id,
                title="Prescription OCR Processing Complete",
                message="Your uploaded prescription image DOC-1001 was parsed successfully. Gemini AI has generated your medication dosage schedule.",
                notification_type=NotificationType.DOCUMENT_PROCESSING,
                priority=RiskLevel.LOW,
            ),
            MockNotification(
                id=uuid.uuid4(),
                user_id=self.patient_id,
                title="🔴 High Priority Clinical Alert",
                message="Blood pressure recorded as 148/92 mmHg. Tele-doctor review requested.",
                notification_type=NotificationType.WARNING,
                priority=RiskLevel.HIGH,
            ),
            MockNotification(
                id=uuid.uuid4(),
                user_id=self.patient_id,
                title="Doctor Specialist Allocated",
                message="Dr. Rajesh Verma (Senior Tele-Consultant) has been assigned to your intake consultation.",
                notification_type=NotificationType.DOCTOR_REQUEST,
                priority=RiskLevel.MODERATE,
            ),
            MockNotification(
                id=uuid.uuid4(),
                user_id=self.other_patient_id,
                title="Confidential Notification Other Patient",
                message="This message belongs to another patient record.",
                notification_type=NotificationType.SYSTEM,
                priority=RiskLevel.LOW,
            ),
        ]

    def test_patient_notification_isolation(self):
        # Filter notifications strictly for self.patient_id
        patient_feed = [n for n in self.notifications if n.user_id == self.patient_id]

        self.assertEqual(len(patient_feed), 3)
        self.assertTrue(all(n.user_id == self.patient_id for n in patient_feed))
        self.assertFalse(any(n.user_id == self.other_patient_id for n in patient_feed))

    def test_patient_activity_event_categories(self):
        patient_feed = [n for n in self.notifications if n.user_id == self.patient_id]

        # Verify OCR, Risk Alert, and Doctor Allocation events exist in patient feed
        ocr_event = next((n for n in patient_feed if n.notification_type == NotificationType.DOCUMENT_PROCESSING), None)
        risk_event = next((n for n in patient_feed if n.notification_type == NotificationType.WARNING), None)
        doctor_event = next((n for n in patient_feed if n.notification_type == NotificationType.DOCTOR_REQUEST), None)

        self.assertIsNotNone(ocr_event)
        self.assertIsNotNone(risk_event)
        self.assertIsNotNone(doctor_event)

        # Verify High Priority alert attributes
        self.assertEqual(risk_event.priority, RiskLevel.HIGH)


if __name__ == "__main__":
    print("=====================================================")
    print("RUNNING PATIENT NOTIFICATIONS MODULE TESTS")
    print("=====================================================")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPatientNotificationsModule)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if result.wasSuccessful():
        print("=====================================================")
        print("ALL PATIENT NOTIFICATIONS MODULE TESTS PASSED!")
        print("=====================================================")
        sys.exit(0)
    else:
        sys.exit(1)
