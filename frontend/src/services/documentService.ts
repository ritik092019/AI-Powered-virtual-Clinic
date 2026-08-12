import axios from 'axios';
import { PatientDocumentSummaryPayload, PatientDocumentSummaryResult } from '../types/document';

export interface OcrExtractionResult {
  documentId: string;
  rawText: string;
  extractedText?: string;
  confidence: number;
  extractedAt: string;
  structuredData: {
    medications?: Array<{ name: string; dosage?: string; frequency?: string }>;
    labResults?: Array<{ testName: string; value: string; unit?: string; flag?: string }>;
    vitals?: { spo2?: number; bloodPressure?: string; temperature?: number; heartRate?: number };
    diagnosis?: string[];
  };
}

const SUMMARY_ENDPOINT = '/api/v1/ocr/patient-document-summary';

export const documentService = {
  /**
   * Validate uploaded file format and size
   */
  validateFile: (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 15 * 1024 * 1024; // 15MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Unsupported file type. Please upload JPG, PNG, WEBP, or PDF.' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds maximum limit of 15MB.' };
    }
    return { valid: true };
  },

  /**
   * Process document OCR parsing (mock/API)
   */
  processOCR: async (file: File, documentId: string): Promise<OcrExtractionResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const text = `Scanned Report: ${file.name}\nPatient: Ramesh Patel\nDiagnosis: Hypertension & Type 2 Diabetes\nRx: Metformin 500mg BID, Amlodipine 5mg OD\nLab: HbA1c 7.8%, Fasting Glucose 182 mg/dL`;
        resolve({
          documentId,
          rawText: text,
          extractedText: text,
          confidence: 0.94,
          extractedAt: new Date().toISOString(),
          structuredData: {
            medications: [
              { name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily' },
              { name: 'Amlodipine', dosage: '5mg', frequency: 'Once Daily' },
            ],
            labResults: [
              { testName: 'HbA1c', value: '7.8%', flag: 'HIGH' },
              { testName: 'Fasting Glucose', value: '182 mg/dL', flag: 'HIGH' },
            ],
            vitals: { bloodPressure: '130/85', spo2: 97 },
            diagnosis: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
          },
        });
      }, 1000);
    });
  },

  /**
   * Fetch structured patient-friendly AI summary for a scanned medical document / prescription
   */
  getPatientDocumentSummary: async (
    payload: PatientDocumentSummaryPayload
  ): Promise<PatientDocumentSummaryResult> => {
    try {
      const response = await axios.post(SUMMARY_ENDPOINT, payload);
      return response.data.data;
    } catch (err) {
      console.warn('Backend API request failed, generating fallback mock summary:', err);
      // Fallback mock response for offline preview
      return {
        document_id: payload.document_id || 'DOC-1001',
        document_name: 'Lab_Report_HbA1c_Glucose.pdf',
        patient_friendly_summary:
          'This pathology lab report measures your blood sugar levels over the past 3 months. Your HbA1c level is slightly elevated, indicating a need for blood sugar monitoring.',
        important_findings: [
          'HbA1c: 7.8% (Elevated blood sugar level over past 3 months)',
          'Fasting Blood Glucose: 182 mg/dL (Above normal fasting range)',
          'Serum Creatinine: 1.1 mg/dL (Normal kidney function indicator)',
        ],
        detected_medications: [
          {
            name: 'Metformin 500mg',
            dosage: '1 tablet twice daily (after breakfast & dinner)',
            purpose: 'Lowers blood sugar levels',
            duration: 'Ongoing / as prescribed',
          },
          {
            name: 'Teneligliptin 20mg',
            dosage: '1 tablet once daily before breakfast',
            purpose: 'Helps regulate blood insulin response',
            duration: 'Ongoing',
          },
        ],
        medication_steps_to_take: [
          'Step 1: Take Metformin 500mg with water immediately after completing breakfast.',
          'Step 2: Take Teneligliptin 20mg 15 minutes before your morning meal.',
          'Step 3: Take your second dose of Metformin 500mg after dinner.',
          'Step 4: Keep a daily log of fasting blood glucose measurements.',
        ],
        precautions: [
          'Avoid refined sugar, sweets, carbonated soft drinks, and high-carb processed foods.',
          'Do not skip meals after taking diabetes medication to prevent sudden low blood sugar (hypoglycemia).',
          'Drink at least 8 to 10 glasses of clean water daily.',
        ],
        recommended_next_steps: [
          'Schedule a follow-up review with your doctor in 14 days.',
          'Repeat HbA1c blood test in 90 days to evaluate treatment progress.',
          'Engage in 30 minutes of light walking daily.',
        ],
        created_at: new Date().toISOString(),
      };
    }
  },
};
