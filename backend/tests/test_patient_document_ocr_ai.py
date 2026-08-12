import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.ocr.schemas import PatientDocumentSummaryRequest
from app.ocr.services.patient_document_ai_service import PatientDocumentAIService


class TestPatientDocumentOCRAI(unittest.TestCase):

    def test_patient_document_summary_lab_report(self):
        req = PatientDocumentSummaryRequest(
            document_id="DOC-1001",
            document_type="LAB_REPORT",
            raw_text="Lab Report: HbA1c 7.8% (High), Fasting Glucose 182 mg/dL, Serum Creatinine 1.1 mg/dL.",
        )
        res = PatientDocumentAIService.generate_patient_summary(req)

        self.assertEqual(res.document_id, "DOC-1001")
        self.assertTrue(len(res.patient_friendly_summary) > 0)
        self.assertTrue(len(res.important_findings) > 0)
        self.assertTrue(len(res.detected_medications) > 0)
        self.assertTrue(len(res.medication_steps_to_take) > 0)
        self.assertTrue(len(res.precautions) > 0)
        self.assertTrue(len(res.recommended_next_steps) > 0)

        # Check detected medication structure
        med = res.detected_medications[0]
        self.assertTrue(len(med.name) > 0)
        self.assertTrue(len(med.dosage) > 0)

    def test_patient_document_summary_discharge_summary(self):
        req = PatientDocumentSummaryRequest(
            document_id="DOC-1002",
            document_type="DISCHARGE_SUMMARY",
            raw_text="Discharge Summary: Acute Respiratory Infection. Rx Amoxicillin 500mg TID 5 days. SpO2 97%, BP 122/80.",
        )
        res = PatientDocumentAIService.generate_patient_summary(req)

        self.assertEqual(res.document_id, "DOC-1002")
        self.assertTrue("Discharge" in res.document_name or "1002" in res.document_name)
        self.assertTrue(any("Amoxicillin" in m.name for m in res.detected_medications))
        self.assertTrue(any("antibiotic" in s.lower() or "step" in s.lower() for s in res.medication_steps_to_take))


if __name__ == "__main__":
    print("=====================================================")
    print("RUNNING PATIENT DOCUMENT OCR & AI SUMMARY TESTS")
    print("=====================================================")
    suite = unittest.TestLoader().loadTestsFromTestCase(TestPatientDocumentOCRAI)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if result.wasSuccessful():
        print("=====================================================")
        print("ALL PATIENT DOCUMENT OCR & AI SUMMARY TESTS PASSED!")
        print("=====================================================")
        sys.exit(0)
    else:
        sys.exit(1)
