import sys
import os
import uuid
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.doctors.schemas import EndCallRequest
from app.doctors.services.video_call_service import VideoCallService

class TestWebRTCCallSignalingModule(unittest.TestCase):
    def test_end_video_call(self):
        c_id = uuid.uuid4()
        req = EndCallRequest(
            consultation_id=c_id,
            call_duration_seconds=325,
            doctor_notes="Patient blood pressure stable. Advised 30 mins morning walk.",
            follow_up_date="18 Aug 2026",
            status="Completed"
        )
        res = VideoCallService.end_call(req)
        self.assertEqual(res.status, "Completed")
        self.assertEqual(res.call_duration_seconds, 325)
        self.assertEqual(res.call_duration_formatted, "05:25")
        self.assertIn("stable", res.doctor_notes)

    def test_get_call_session(self):
        c_id = uuid.uuid4()
        session = VideoCallService.get_call_session(c_id)
        self.assertEqual(session["consultation_id"], str(c_id))
        self.assertEqual(session["status"], "In Consultation")

if __name__ == '__main__':
    unittest.main()
