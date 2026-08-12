export type Role = 'HEALTH_WORKER' | 'DOCTOR' | 'ADMIN' | 'PATIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  title: string;
  centerName: string;
  region: string;
  phone?: string;
  badgeNumber?: string;
  patientId?: string;
}

export interface MedicalHistoryItem {
  id: string;
  patientId?: string;
  condition: string;
  diagnosedYear?: string;
  status: 'active' | 'resolved' | 'managed';
  source?: 'User-Entered' | 'Clinical Log' | 'Current Visit Intake';
  notes?: string;
  recordedAt?: string;
}

export interface MedicationItem {
  id: string;
  patientId?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  status?: 'active' | 'discontinued';
  isCurrent?: boolean;
  prescribedBy?: string;
  source?: 'User-Entered' | 'Prescription' | 'Current Visit Intake';
  addedAt?: string;
}

export interface AllergyItem {
  id: string;
  patientId?: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  source?: 'User-Entered' | 'Current Visit Intake';
  addedAt?: string;
}

export interface PatientTimelineEvent {
  id: string;
  patientId: string;
  type: 'registration' | 'consultation' | 'document' | 'image' | 'doctor_request' | 'status_change' | 'medical_history';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  author: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  village: string;
  district: string;
  abhaId?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  registeredAt: string;
  preferredLanguage: string;
  latestConsultationDate?: string;
  latestConsultationStatus?: 'draft' | 'submitted' | 'under_review' | 'completed' | 'urgent_referral';
  priority?: 'routine' | 'urgent' | 'emergency';
  medicalHistory?: MedicalHistoryItem[];
  medications?: MedicationItem[];
  allergies?: AllergyItem[];
  documents?: MedicalDocument[];
  images?: PatientImage[];
  timeline?: PatientTimelineEvent[];
  alerts?: string[];
}

export interface VitalSigns {
  id?: string;
  bpSystolic: number;
  bpDiastolic: number;
  pulseRate: number;
  tempFahrenheit: number;
  spo2Percentage: number;
  respiratoryRate?: number;
  bloodGlucoseMgDl?: number;
  capturedAt: string;
}

export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  durationDays?: number;
  duration?: string;
  onset?: 'sudden' | 'gradual' | 'intermittent';
  notes?: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  category: 'prescription' | 'lab_report' | 'vitals_sheet' | 'imaging' | 'discharge_summary';
  uploadedAt: string;
  fileUrl: string;
  fileSize?: string;
  ocrStatus?: 'pending' | 'completed' | 'failed';
  ocrSummary?: string;
  ocrExtractedText?: string;
  notes?: string;
}

export interface PatientImage {
  id: string;
  patientId: string;
  title: string;
  imageUrl: string;
  capturedAt: string;
  bodyPart?: string;
  status?: 'pending_analysis' | 'processed';
  notes?: string;
}

export interface SuspectedCondition {
  name: string;
  probability: number; // 0 to 100
  urgency: 'low' | 'moderate' | 'high' | 'emergency';
}

export interface ProtocolGuidance {
  id: string;
  title: string;
  whatToDo: string[];
  whatToAvoid: string[];
  whatToMonitor: string[];
  warningSigns: string[];
  whenToSeekHelp: string[];
  disclaimer: string;
}

export interface AIAssessment {
  id: string;
  consultationId: string;
  summary: string;
  suspectedConditions: SuspectedCondition[];
  recommendedTriage: 'home_care' | 'primary_health_center' | 'district_hospital' | 'emergency_referral';
  flags: string[];
  missingInformation?: string[];
  generatedAt: string;
  isUnavailable?: boolean;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'immediate_evaluation';

export interface RiskAssessment {
  level: RiskLevel;
  label: string;
  rationale: string;
  recommendedNextStep: string;
  escalationRequired: boolean;
  escalationReason?: string;
  flags: string[];
}

export interface DoctorMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'HEALTH_WORKER' | 'DOCTOR';
  text: string;
  timestamp: string;
  deliveryStatus: 'sent' | 'delivered' | 'read';
}

export interface ConsultationTimelineEvent {
  id: string;
  consultationId: string;
  type:
    | 'created'
    | 'submitted'
    | 'ai_analyzed'
    | 'risk_assessed'
    | 'doctor_requested'
    | 'doctor_accepted'
    | 'message_sent'
    | 'note_added'
    | 'referral_recommended'
    | 'completed';
  title: string;
  description: string;
  author: string;
  authorRole: 'HEALTH_WORKER' | 'DOCTOR' | 'SYSTEM_AI';
  timestamp: string;
  statusBadge?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  healthWorkerId: string;
  healthWorkerName: string;
  doctorId?: string;
  doctorName?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'completed' | 'urgent_referral';
  chiefComplaint: string;
  vitals?: VitalSigns;
  symptoms: Symptom[];
  priority: 'routine' | 'urgent' | 'emergency';
  createdAt: string;
  updatedAt: string;
  voiceTranscript?: {
    language: string;
    rawTranscript: string;
    confirmedTranscript: string;
    confirmedAt?: string;
  };
  documents?: MedicalDocument[];
  images?: PatientImage[];
  imageObservations?: Array<{
    imageId: string;
    title: string;
    bodyPart: string;
    observationSummary: string;
    disclaimer: string;
  }>;
  additionalMedicalHistory?: MedicalHistoryItem[];
  confirmedMedications?: MedicationItem[];
  confirmedAllergies?: AllergyItem[];
  noKnownAllergies?: boolean;
  notes?: string;
  lastSavedAt?: string;
}

export interface ConsultationDraft extends Partial<Consultation> {
  currentStepIndex?: number;
  completedSteps?: number[];
  lastSavedAt?: string;
}

export type ConsultationStepId =
  | 'patient'
  | 'complaint'
  | 'symptoms'
  | 'history'
  | 'meds_allergies'
  | 'vitals'
  | 'voice'
  | 'documents'
  | 'images'
  | 'review'
  | 'submit';

export interface DoctorRequest {
  id: string;
  consultationId: string;
  patientName: string;
  requestingWorkerName: string;
  specialtyNeeded: string;
  priority: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  requestedAt: string;
  notes?: string;
}

export interface DoctorNote {
  id: string;
  consultationId: string;
  doctorName: string;
  diagnosis: string;
  prescription: string;
  advice: string;
  followUpDays: number;
  outcome?: 'completed' | 'referred' | 'follow_up_recommended';
  referralCenter?: string;
  signedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'emergency';
  timestamp: string;
  read: boolean;
  actionLink?: string;
  link?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty?: string;
  facilityName: string;
  date: string;
  time: string;
  type: 'tele_consultation' | 'in_person_visit' | 'follow_up';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  chiefComplaint?: string;
  notes?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface SystemStatus {
  isOnline: boolean;
  syncPendingCount: number;
  lastSyncedAt: string;
  latencyMs: number;
  backendHealth: 'healthy' | 'degraded' | 'offline';
}
