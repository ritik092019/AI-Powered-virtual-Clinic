import { MedicalDocument, VitalSigns } from '../types';

export interface OcrExtractionResult {
  extractedText: string;
  structuredData: {
    chiefComplaintFound?: string;
    vitalsFound?: Partial<VitalSigns>;
    medicationsFound?: Array<{ name: string; dosage: string; frequency: string }>;
    labResultsFound?: Array<{ testName: string; value: string; normalRange: string }>;
  };
  confidenceScore: number;
}

export const documentService = {
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Unsupported file format. Please upload a PDF, JPG, PNG, or WEBP document.' };
    }

    if (file.size > maxSizeBytes) {
      return { valid: false, error: 'File size exceeds 10MB limit. Please compress or choose a smaller file.' };
    }

    return { valid: true };
  },

  async processOCR(file: File, category: string, forceFail: boolean = false): Promise<OcrExtractionResult> {
    // Simulate OCR Processing delay
    await new Promise((resolve) => setTimeout(resolve, 1800));

    if (forceFail) {
      throw new Error('OCR text recognition failed due to low contrast or blurry scan.');
    }

    if (category === 'lab_report') {
      return {
        extractedText: 'CLINICAL LAB REPORT:\nFasting Blood Glucose: 138 mg/dL (70-100)\nHbA1c: 7.2% (Normal < 5.7%)\nHemoglobin: 11.2 g/dL (12-16)',
        structuredData: {
          chiefComplaintFound: 'Routine Diabetes & Anemia Follow-up',
          vitalsFound: {
            bloodGlucoseMgDl: 138,
          },
          labResultsFound: [
            { testName: 'Fasting Blood Sugar', value: '138 mg/dL', normalRange: '70-100 mg/dL' },
            { testName: 'HbA1c', value: '7.2 %', normalRange: '< 5.7 %' },
            { testName: 'Hemoglobin', value: '11.2 g/dL', normalRange: '12.0 - 16.0 g/dL' },
          ],
        },
        confidenceScore: 0.92,
      };
    }

    if (category === 'vitals_sheet') {
      return {
        extractedText: 'PHC VITALS LOG SHEET:\nBP: 142/92 mmHg\nPulse: 88 bpm\nTemp: 100.4 F\nSpO2: 96%',
        structuredData: {
          vitalsFound: {
            bpSystolic: 142,
            bpDiastolic: 92,
            pulseRate: 88,
            tempFahrenheit: 100.4,
            spo2Percentage: 96,
          },
        },
        confidenceScore: 0.95,
      };
    }

    // Default Prescription sheet OCR
    return {
      extractedText: 'Rx PHC RAMPUR:\n1. Tab Amlodipine 5mg OD x 30 days\n2. Tab Paracetamol 500mg BD x 3 days\n3. Cap Amoxicillin 500mg TDS x 5 days',
      structuredData: {
        chiefComplaintFound: 'Prescribed medication renewal and fever management.',
        medicationsFound: [
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (OD)' },
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily (BD)' },
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'Thrice daily (TDS)' },
        ],
      },
      confidenceScore: 0.89,
    };
  },
};
