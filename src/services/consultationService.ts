import { Consultation, ConsultationDraft } from '../types';
import { MOCK_CONSULTATIONS } from '../mock';

const DRAFT_KEY = 'telemedicine_consultation_draft_v1';

export const consultationService = {
  async getConsultations(): Promise<Consultation[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...MOCK_CONSULTATIONS];
  },

  async getConsultationById(id: string): Promise<Consultation | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_CONSULTATIONS.find((c) => c.id === id) || null;
  },

  saveDraft(draft: ConsultationDraft): void {
    try {
      const payload = {
        ...draft,
        lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist draft to localStorage', e);
    }
  },

  getDraft(): ConsultationDraft | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ConsultationDraft;
    } catch (e) {
      return null;
    }
  },

  clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      console.warn('Failed to clear draft from localStorage', e);
    }
  },

  async createConsultation(data: Partial<Consultation>): Promise<Consultation> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newConsultation: Consultation = {
      id: `CNS-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: data.patientId || 'PAT-1082',
      patientName: data.patientName || 'Ramesh Patel',
      patientAge: data.patientAge || 54,
      patientGender: data.patientGender || 'Male',
      healthWorkerId: 'usr_hw_01',
      healthWorkerName: 'Anita Sharma',
      status: data.status || 'submitted',
      chiefComplaint: data.chiefComplaint || 'Acute health assessment intake.',
      vitals: data.vitals,
      symptoms: data.symptoms || [],
      priority: data.priority || 'routine',
      voiceTranscript: data.voiceTranscript,
      documents: data.documents || [],
      images: data.images || [],
      imageObservations: data.imageObservations || [],
      additionalMedicalHistory: data.additionalMedicalHistory || [],
      confirmedMedications: data.confirmedMedications || [],
      confirmedAllergies: data.confirmedAllergies || [],
      noKnownAllergies: data.noKnownAllergies,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: 'Just now',
    };

    MOCK_CONSULTATIONS.unshift(newConsultation);
    this.clearDraft();
    return newConsultation;
  },
};
