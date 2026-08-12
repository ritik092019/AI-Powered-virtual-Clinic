export interface DetectedMedication {
  name: string;
  dosage: string;
  purpose?: string;
  duration?: string;
}

export interface PatientDocumentSummaryPayload {
  document_id?: string;
  raw_text?: string;
  document_type?: string;
}

export interface PatientDocumentSummaryResult {
  document_id: string;
  document_name: string;
  patient_friendly_summary: string;
  important_findings: string[];
  detected_medications: DetectedMedication[];
  medication_steps_to_take: string[];
  precautions: string[];
  recommended_next_steps: string[];
  created_at: string;
}
