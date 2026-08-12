import sys
import os
import uuid
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.patients.schemas import PatientDoctorChatMessageRequest
from app.patients.services.patient_consultation_service import PatientConsultationService

class TestPatientDoctorConsultationModule(unittest.TestCase):
    def test_get_patient_doctor_consultations(self):
        patient_id = uuid.uuid4()
        res = PatientConsultationService.get_patient_doctor_consultations(patient_id)
        self.assertIsInstance(res, list)
        self.assertTrue(len(res) > 0)
        first = res[0]
        self.assertTrue(first.doctor.name.startswith("Dr. "))
        self.assertEqual(first.status, "In Consultation")
        self.assertTrue(len(first.chat_messages) > 0)

    def test_send_chat_message(self):
        patient_id = uuid.uuid4()
        c_id = uuid.uuid4()
        req = PatientDoctorChatMessageRequest(
            consultation_id=c_id,
            message_text="Hello Doctor, I took the Metformin dose after breakfast."
        )
        msg = PatientConsultationService.send_chat_message(patient_id, req)
        self.assertEqual(msg.sender_role, "PATIENT")
        self.assertIn("Metformin", msg.message_text)

if __name__ == '__main__':
    unittest.main()
