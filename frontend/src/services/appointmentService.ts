import { API_BASE_URL, getAuthHeaders } from '../constants';

export interface AppointmentCreatePayload {
  consultation_type: string;
  symptoms: string;
  duration?: string;
  severity?: string;
  age?: number;
  existing_conditions?: string[];
  allergies?: string[];
  current_medications?: string[];
  vitals?: Record<string, any>;
  voice_transcript?: string;
  preferred_language: string;
  preferred_date?: string;
  preferred_time?: string;
}

export interface DoctorInfoResponse {
  doctor_id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experience_years: number;
  license_number: string;
  language?: string;
}

export interface AppointmentModelResponse {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id?: string;
  doctor?: DoctorInfoResponse;
  status: 'PENDING_QUEUE' | 'ASSIGNED' | 'CONFIRMED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  consultation_type: string;
  symptoms: string;
  duration?: string;
  severity?: string;
  age?: number;
  existing_conditions: string[];
  allergies: string[];
  current_medications: string[];
  vitals: Record<string, any>;
  voice_transcript?: string;
  preferred_language: string;
  preferred_date?: string;
  preferred_time?: string;
  classified_specialty?: string;
  classification_source: string;
  classification_confidence: number;
  match_score?: number;
  matching_notes?: string;
  webrtc_room_id?: string;
  created_at: string;
  updated_at: string;
}

export const appointmentService = {
  async requestSmartAppointment(payload: AppointmentCreatePayload): Promise<AppointmentModelResponse> {
    const res = await fetch(`${API_BASE_URL}/appointments/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || data.detail || 'Failed to submit appointment request.');
    }
    return data.data;
  },

  async getMyAppointments(): Promise<AppointmentModelResponse[]> {
    const res = await fetch(`${API_BASE_URL}/appointments/my-appointments`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || data.detail || 'Failed to fetch appointments.');
    }
    return data.data;
  },

  async doctorActionAppointment(id: string, action: 'accept' | 'decline', reason?: string): Promise<AppointmentModelResponse> {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/doctor-action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, reason }),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || data.detail || 'Failed to execute doctor action.');
    }
    return data.data;
  },

  async cancelAppointment(id: string): Promise<AppointmentModelResponse> {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || data.detail || 'Failed to cancel appointment.');
    }
    return data.data;
  },
};
