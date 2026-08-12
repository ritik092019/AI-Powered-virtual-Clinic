import { DoctorRequest, DoctorNote, DoctorMessage } from '../types';
import { MOCK_DOCTOR_REQUESTS } from '../mock';

// In-memory store initialized from mock data
let doctorRequestsStore: DoctorRequest[] = [...MOCK_DOCTOR_REQUESTS];

const initialMessagesStore: Record<string, DoctorMessage[]> = {
  'CNS-9021': [
    {
      id: 'msg-01',
      consultationId: 'CNS-9021',
      senderId: 'usr_hw_01',
      senderName: 'Anita Sharma (ANM)',
      senderRole: 'HEALTH_WORKER',
      text: 'Dr. Verma, patient Ramesh Patel (54M) presented with acute retrosternal chest tightness, BP 150/95, SpO2 91%. AI risk engine flagged immediate evaluation.',
      timestamp: '10:20 AM',
      deliveryStatus: 'read',
    },
    {
      id: 'msg-02',
      consultationId: 'CNS-9021',
      senderId: 'usr_doc_01',
      senderName: 'Dr. Rajesh Verma',
      senderRole: 'DOCTOR',
      text: 'Acknowledged Anita. Keep patient resting quietly in semi-fowler position. Administer high-flow oxygen via nasal cannula if available at SHC.',
      timestamp: '10:22 AM',
      deliveryStatus: 'read',
    },
    {
      id: 'msg-03',
      consultationId: 'CNS-9021',
      senderId: 'usr_hw_01',
      senderName: 'Anita Sharma (ANM)',
      senderRole: 'HEALTH_WORKER',
      text: 'Oxygen nasal cannula started at 4L/min. SpO2 improved slightly to 93%. Ambulance transport ticket #AMB-902 requested.',
      timestamp: '10:25 AM',
      deliveryStatus: 'read',
    },
  ],
  'CNS-9020': [
    {
      id: 'msg-101',
      consultationId: 'CNS-9020',
      senderId: 'usr_hw_01',
      senderName: 'Anita Sharma (ANM)',
      senderRole: 'HEALTH_WORKER',
      text: 'Doctor, Sunita Devi (38F) has fever 102.4°F, RR 26/min, rusty sputum. Suspected pneumonia.',
      timestamp: '11:05 AM',
      deliveryStatus: 'delivered',
    },
  ],
};

const messagesStore: Record<string, DoctorMessage[]> = { ...initialMessagesStore };
const doctorNotesStore: Record<string, DoctorNote> = {};

export const doctorService = {
  async getDoctorRequests(filter?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<DoctorRequest[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    let result = [...doctorRequestsStore];

    if (filter?.status && filter.status !== 'all') {
      result = result.filter((r) => r.status === filter.status);
    }

    if (filter?.priority && filter.priority !== 'all') {
      result = result.filter((r) => r.priority === filter.priority);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(q) ||
          r.consultationId.toLowerCase().includes(q) ||
          r.specialtyNeeded.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    return result;
  },

  async getDoctorRequestByConsultationId(consultationId: string): Promise<DoctorRequest | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return doctorRequestsStore.find((r) => r.consultationId === consultationId);
  },

  async createDoctorRequest(payload: {
    consultationId: string;
    patientName: string;
    requestingWorkerName: string;
    specialtyNeeded: string;
    priority: 'routine' | 'urgent' | 'emergency';
    notes?: string;
  }): Promise<DoctorRequest> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const existingIndex = doctorRequestsStore.findIndex((r) => r.consultationId === payload.consultationId);
    const newReq: DoctorRequest = {
      id: `DOC-REQ-${Date.now().toString().slice(-4)}`,
      consultationId: payload.consultationId,
      patientName: payload.patientName,
      requestingWorkerName: payload.requestingWorkerName,
      specialtyNeeded: payload.specialtyNeeded,
      priority: payload.priority,
      status: 'pending',
      requestedAt: 'Just now',
      notes: payload.notes || 'Tele-doctor authorization requested by health worker.',
    };

    if (existingIndex >= 0) {
      doctorRequestsStore[existingIndex] = newReq;
    } else {
      doctorRequestsStore.unshift(newReq);
    }

    return newReq;
  },

  async acceptDoctorRequest(requestId: string, doctorName = 'Dr. Rajesh Verma'): Promise<DoctorRequest> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const req = doctorRequestsStore.find((r) => r.id === requestId || r.consultationId === requestId);
    if (!req) {
      throw new Error('Doctor request not found');
    }
    req.status = 'accepted';

    // System automatic greeting chat message
    if (!messagesStore[req.consultationId]) {
      messagesStore[req.consultationId] = [];
    }
    messagesStore[req.consultationId].push({
      id: `msg_sys_${Date.now()}`,
      consultationId: req.consultationId,
      senderId: 'usr_doc_01',
      senderName: doctorName,
      senderRole: 'DOCTOR',
      text: `Case request accepted by ${doctorName}. Reviewing clinical intake data now.`,
      timestamp: 'Just now',
      deliveryStatus: 'delivered',
    });

    return { ...req };
  },

  async getDoctorMessages(consultationId: string): Promise<DoctorMessage[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return messagesStore[consultationId] || [];
  },

  async sendDoctorMessage(
    consultationId: string,
    text: string,
    senderRole: 'HEALTH_WORKER' | 'DOCTOR',
    senderName: string
  ): Promise<DoctorMessage> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!messagesStore[consultationId]) {
      messagesStore[consultationId] = [];
    }

    const newMessage: DoctorMessage = {
      id: `msg_${Date.now()}`,
      consultationId,
      senderId: senderRole === 'DOCTOR' ? 'usr_doc_01' : 'usr_hw_01',
      senderName,
      senderRole,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'delivered',
    };

    messagesStore[consultationId].push(newMessage);
    return newMessage;
  },

  async submitDoctorNote(consultationId: string, note: Partial<DoctorNote>): Promise<DoctorNote> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const createdNote: DoctorNote = {
      id: `doc_note_${Date.now()}`,
      consultationId,
      doctorName: note.doctorName || 'Dr. Rajesh Verma',
      diagnosis: note.diagnosis || 'Confirmed Acute Lower Respiratory Tract Infection / CAP',
      prescription:
        note.prescription ||
        '1. Tab. Amoxicillin-Clavulanate 625mg BD x 5 days\n2. Syrup Paracetamol 10ml TID PRN fever >100°F\n3. Salbutamol Nebulization 2.5mg BD PRN wheezing',
      advice:
        note.advice ||
        'Strict bed rest. Maintain oral fluid intake. Monitor SpO2 every 4 hours. Refer to District Hospital if SpO2 drops <92%.',
      followUpDays: note.followUpDays || 3,
      outcome: note.outcome || 'completed',
      referralCenter: note.referralCenter || '',
      signedAt: new Date().toISOString(),
    };

    doctorNotesStore[consultationId] = createdNote;

    // Update request status to completed
    const req = doctorRequestsStore.find((r) => r.consultationId === consultationId);
    if (req) {
      req.status = 'completed';
    }

    return createdNote;
  },

  async getDoctorNoteByConsultationId(consultationId: string): Promise<DoctorNote | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return doctorNotesStore[consultationId];
  },
};
