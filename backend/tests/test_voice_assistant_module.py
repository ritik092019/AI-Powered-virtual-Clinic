import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.speech.schemas import VoiceAssistantRequest, VoiceAssistantResponse
from app.speech.services.voice_assistant_service import VoiceAssistantService

class TestVoiceAssistantModule(unittest.TestCase):
    def test_voice_assistant_hindi(self):
        req = VoiceAssistantRequest(
            language="hi",
            user_transcript="मरीज को बुखार और सिर दर्द है",
            user_role="PATIENT"
        )
        res = VoiceAssistantService.process_voice_assistant(req)
        self.assertIsInstance(res, VoiceAssistantResponse)
        self.assertEqual(res.language, "hi")
        self.assertIn("Hindi", res.language_name)
        self.assertTrue(len(res.extracted_symptoms) > 0)
        self.assertTrue(len(res.ai_response_text) > 0)

    def test_voice_assistant_telugu(self):
        req = VoiceAssistantRequest(
            language="te",
            user_transcript="నాకు జ్వరం ఉంది",
            user_role="HEALTH_WORKER"
        )
        res = VoiceAssistantService.process_voice_assistant(req)
        self.assertEqual(res.language, "te")
        self.assertIn("Telugu", res.language_name)
        self.assertTrue(len(res.extracted_symptoms) > 0)

    def test_voice_assistant_fallback_speech(self):
        req = VoiceAssistantRequest(
            language="ta",
            user_role="PATIENT"
        )
        res = VoiceAssistantService.process_voice_assistant(req)
        self.assertEqual(res.language, "ta")
        self.assertTrue(len(res.raw_transcript) > 0)

if __name__ == '__main__':
    unittest.main()
