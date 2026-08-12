import axios from 'axios';

export interface AssignedDoctorInfo {
  doctor_id: string;
  name: string;
  specialization: string;
  qualifications: string;
  experience_years: number;
  license_number: string;
}

export interface PatientChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'DOCTOR' | 'PATIENT';
  message_text: string;
  timestamp: string;
}

export interface PatientDoctorConsultation {
  consultation_id: string;
  patient_id: string;
  patient_name: string;
  doctor?: AssignedDoctorInfo;
  status: 'Waiting' | 'Doctor Assigned' | 'Scheduled' | 'In Consultation' | 'Completed' | 'Follow-up Required';
  chief_complaint: string;
  appointment_date_time: string;
  follow_up_date?: string;
  doctor_notes?: string;
  prescriptions: string[];
  follow_up_instructions: string[];
  chat_messages: PatientChatMessage[];
  created_at: string;
}

export const patientDoctorConsultationService = {
  getPatientConsultations: async (): Promise<PatientDoctorConsultation[]> => {
    try {
      const response = await axios.get('/api/v1/patients/my-consultations');
      return response.data.data;
    } catch (err) {
      console.warn('Backend endpoint unavailable, using mock patient doctor consultations.', err);
      return patientDoctorConsultationService.getMockConsultations();
    }
  },

  sendChatMessage: async (consultation_id: string, message_text: string): Promise<PatientChatMessage> => {
    try {
      const response = await axios.post('/api/v1/patients/consultations/chat', {
        consultation_id,
        message_text,
      });
      return response.data.data;
    } catch (err) {
      console.warn('Backend chat unavailable, appending local mock message.', err);
      return {
        id: `msg_mock_${Math.random().toString(36).substring(2, 8)}`,
        sender_id: 'user_pat_101',
        sender_name: 'Patient',
        sender_role: 'PATIENT',
        message_text: message_text.trim(),
        timestamp: new Date().toISOString(),
      };
    }
  },

  getMockConsultations: (): PatientDoctorConsultation[] => [
    {
      consultation_id: 'c1111111-1111-4111-a111-111111111111',
      patient_id: 'pat_101',
      patient_name: 'Ramesh Patel',
      doctor: {
        doctor_id: 'doc_201',
        name: 'Dr. Rajesh Verma',
        specialization: 'Senior Tele-Consultant / General Medicine',
        qualifications: 'MBBS, MD (Internal Medicine)',
        experience_years: 14,
        license_number: 'MCI-889021',
      },
      status: 'In Consultation',
      chief_complaint: 'Elevated blood sugar and mild morning headache for 3 days',
      appointment_date_time: 'Today, 11:30 AM',
      follow_up_date: '18 Aug 2026',
      doctor_notes:
        'Patient responds well to Metformin 500mg. Continue morning dosage after breakfast. Hydrate with 3L warm water daily.',
      prescriptions: [
        'Metformin 500mg - 1 tablet twice daily (after breakfast & dinner)',
        'Teneligliptin 20mg - 1 tablet once daily before breakfast',
        'Paracetamol 650mg - 1 tablet as needed for headache',
      ],
      follow_up_instructions: [
        '1. Measure fasting blood sugar twice weekly.',
        '2. Maintain low-salt, low-sugar diet.',
        '3. Re-visit clinic in 7 days for follow-up review.',
      ],
      chat_messages: [
        {
          id: 'msg-1',
          sender_id: 'doc_201',
          sender_name: 'Dr. Rajesh Verma',
          sender_role: 'DOCTOR',
          message_text: 'Namaste. I have reviewed your blood pressure and sugar logs. How are you feeling today?',
          timestamp: '11:32 AM',
        },
        {
          id: 'msg-2',
          sender_id: 'pat_101',
          sender_name: 'Patient',
          sender_role: 'PATIENT',
          message_text: 'Hello Doctor. Fever has reduced, but I still feel mild headache in the morning.',
          timestamp: '11:34 AM',
        },
      ],
      created_at: new Date().toISOString(),
    },
    {
      consultation_id: 'c2222222-2222-4222-a222-222222222222',
      patient_id: 'pat_101',
      patient_name: 'Ramesh Patel',
      doctor: {
        doctor_id: 'doc_202',
        name: 'Dr. Sunita Rao',
        specialization: 'Pulmonology Specialist',
        qualifications: 'MBBS, DNB (Respiratory Diseases)',
        experience_years: 10,
        license_number: 'MCI-441209',
      },
      status: 'Completed',
      chief_complaint: 'Chest congestion and dry cough follow-up',
      appointment_date_time: '10 Aug 2026, 03:00 PM',
      follow_up_date: '25 Aug 2026',
      doctor_notes: 'Chest lungs clear. SpO2 98% on room air.',
      prescriptions: ['Amoxicillin 500mg - 1 capsule 3 times daily (5 days)'],
      follow_up_instructions: ['Avoid cold drinks and dust exposure.'],
      chat_messages: [
        {
          id: 'msg-201',
          sender_id: 'doc_202',
          sender_name: 'Dr. Sunita Rao',
          sender_role: 'DOCTOR',
          message_text: 'Follow-up consultation complete. Chest breathlessness has cleared.',
          timestamp: '10 Aug, 03:15 PM',
        },
      ],
      created_at: new Date().toISOString(),
    },
  ],
};
