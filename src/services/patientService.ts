import {
  Patient,
  VitalSigns,
  MedicalHistoryItem,
  MedicationItem,
  AllergyItem,
  MedicalDocument,
  PatientImage,
  PatientTimelineEvent,
} from '../types';
import { MOCK_PATIENTS } from '../mock';

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return [...MOCK_PATIENTS];
  },

  async getPatientById(id: string): Promise<Patient | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return MOCK_PATIENTS.find((p) => p.id === id) || null;
  },

  async createPatient(patientData: Omit<Patient, 'id' | 'registeredAt'>): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString().split('T')[0];

    const initialTimeline: PatientTimelineEvent[] = [
      {
        id: `tl_${Date.now()}`,
        patientId: newId,
        type: 'registration',
        title: 'Patient Registered',
        description: `Profile initialized for ${patientData.name} at ${patientData.village || 'Sub-Health Centre'}.`,
        timestamp: `${nowIso} Just now`,
        source: 'Frontend Registry',
        author: 'Anita Sharma (ASHA)',
      },
    ];

    const newPatient: Patient = {
      ...patientData,
      id: newId,
      registeredAt: nowIso,
      preferredLanguage: patientData.preferredLanguage || 'Hindi',
      medicalHistory: patientData.medicalHistory || [],
      medications: patientData.medications || [],
      allergies: patientData.allergies || [],
      documents: patientData.documents || [],
      images: patientData.images || [],
      timeline: initialTimeline,
      alerts: patientData.alerts || [],
    };

    MOCK_PATIENTS.unshift(newPatient);
    return newPatient;
  },

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = MOCK_PATIENTS.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Patient with ID ${id} not found`);
    }

    const current = MOCK_PATIENTS[index];
    const updatedTimeline: PatientTimelineEvent[] = [
      ...(current.timeline || []),
      {
        id: `tl_${Date.now()}`,
        patientId: id,
        type: 'status_change',
        title: 'Profile Demographics Updated',
        description: 'Updated patient contact or demographic information.',
        timestamp: `${new Date().toISOString().split('T')[0]} Just now`,
        source: 'User Entry',
        author: 'Anita Sharma (ASHA)',
      },
    ];

    const updatedPatient: Patient = {
      ...current,
      ...updates,
      timeline: updatedTimeline,
    };

    MOCK_PATIENTS[index] = updatedPatient;
    return updatedPatient;
  },

  async deletePatient(id: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = MOCK_PATIENTS.findIndex((p) => p.id === id);
    if (index !== -1) {
      MOCK_PATIENTS.splice(index, 1);
      return true;
    }
    return false;
  },

  async addMedicalHistoryItem(
    patientId: string,
    item: Omit<MedicalHistoryItem, 'id' | 'recordedAt' | 'source' | 'patientId'>
  ): Promise<MedicalHistoryItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    const newItem: MedicalHistoryItem = {
      ...item,
      id: `mh_${Date.now()}`,
      patientId,
      recordedAt: new Date().toISOString().split('T')[0],
      source: 'User-Entered',
    };

    if (patient) {
      patient.medicalHistory = [newItem, ...(patient.medicalHistory || [])];
      patient.timeline = [
        ...(patient.timeline || []),
        {
          id: `tl_${Date.now()}`,
          patientId,
          type: 'medical_history',
          title: 'Medical History Added',
          description: `Logged condition: ${item.condition}`,
          timestamp: 'Just now',
          source: 'User Entry',
          author: 'Anita Sharma (ASHA)',
        },
      ];
    }
    return newItem;
  },

  async addMedicationItem(
    patientId: string,
    item: Omit<MedicationItem, 'id' | 'addedAt' | 'source' | 'patientId'>
  ): Promise<MedicationItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    const newItem: MedicationItem = {
      ...item,
      id: `med_${Date.now()}`,
      patientId,
      addedAt: new Date().toISOString().split('T')[0],
      source: 'User-Entered',
    };

    if (patient) {
      patient.medications = [newItem, ...(patient.medications || [])];
    }
    return newItem;
  },

  async addAllergyItem(
    patientId: string,
    item: Omit<AllergyItem, 'id' | 'addedAt' | 'source' | 'patientId'>
  ): Promise<AllergyItem> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    const newItem: AllergyItem = {
      ...item,
      id: `alg_${Date.now()}`,
      patientId,
      addedAt: new Date().toISOString().split('T')[0],
      source: 'User-Entered',
    };

    if (patient) {
      patient.allergies = [newItem, ...(patient.allergies || [])];
    }
    return newItem;
  },

  async addDocument(patientId: string, docData: Partial<MedicalDocument>): Promise<MedicalDocument> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    const newDoc: MedicalDocument = {
      id: `doc_${Date.now()}`,
      patientId,
      title: docData.title || 'Uploaded Medical Report',
      category: docData.category || 'lab_report',
      uploadedAt: new Date().toISOString().split('T')[0],
      fileUrl: docData.fileUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
      fileSize: docData.fileSize || '1.2 MB',
      ocrStatus: 'completed',
      ocrSummary: docData.ocrSummary || 'Mock OCR extracted clinical parameters: Blood pressure, Hemoglobin levels normal.',
      notes: docData.notes || 'Mock document scan uploaded by health worker.',
    };

    if (patient) {
      patient.documents = [newDoc, ...(patient.documents || [])];
      patient.timeline = [
        ...(patient.timeline || []),
        {
          id: `tl_${Date.now()}`,
          patientId,
          type: 'document',
          title: 'Medical Document Uploaded',
          description: `Uploaded: ${newDoc.title}`,
          timestamp: 'Just now',
          source: 'OCR Scanner',
          author: 'Anita Sharma (ASHA)',
        },
      ];
    }
    return newDoc;
  },

  async deleteDocument(patientId: string, docId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    if (patient && patient.documents) {
      patient.documents = patient.documents.filter((d) => d.id !== docId);
      return true;
    }
    return false;
  },

  async addImage(patientId: string, imgData: Partial<PatientImage>): Promise<PatientImage> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    const newImg: PatientImage = {
      id: `img_${Date.now()}`,
      patientId,
      title: imgData.title || 'Clinical Photo',
      imageUrl: imgData.imageUrl || 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&auto=format&fit=crop&q=80',
      capturedAt: new Date().toISOString().split('T')[0],
      bodyPart: imgData.bodyPart || 'Dermatology / Lesion',
      status: 'processed',
      notes: imgData.notes || 'Mock clinical image uploaded for specialist review.',
    };

    if (patient) {
      patient.images = [newImg, ...(patient.images || [])];
      patient.timeline = [
        ...(patient.timeline || []),
        {
          id: `tl_${Date.now()}`,
          patientId,
          type: 'image',
          title: 'Clinical Image Added',
          description: `Captured photo: ${newImg.title} (${newImg.bodyPart})`,
          timestamp: 'Just now',
          source: 'Camera Capture',
          author: 'Anita Sharma (ASHA)',
        },
      ];
    }
    return newImg;
  },

  async deleteImage(patientId: string, imgId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const patient = MOCK_PATIENTS.find((p) => p.id === patientId);
    if (patient && patient.images) {
      patient.images = patient.images.filter((i) => i.id !== imgId);
      return true;
    }
    return false;
  },

  async recordVitals(patientId: string, vitals: Omit<VitalSigns, 'id' | 'capturedAt'>): Promise<VitalSigns> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      ...vitals,
      id: `vtl_${Date.now()}`,
      capturedAt: new Date().toISOString(),
    };
  },
};

