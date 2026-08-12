export type EmergencyUrgencyLevel = 'CRITICAL_EMERGENCY' | 'HIGH_PRIORITY' | 'MODERATE_URGENT';

export interface EmergencyAssessmentPayload {
  image_base64?: string;
  age?: number;
  symptoms: string[];
  vitals: {
    spo2?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    temp_fahrenheit?: number;
    heart_rate?: number;
  };
  injury_description?: string;
  high_alert_toggled: boolean;
  patient_id?: string;
}

export interface EmergencyAssessmentResult {
  id: string;
  urgency_level: EmergencyUrgencyLevel;
  immediate_first_aid: string[];
  critical_warnings: string[];
  doctor_escalation_required: boolean;
  summary_rationale: string;
  high_alert_sent: boolean;
  status: string;
  model_name: string;
  created_at: string;
}
