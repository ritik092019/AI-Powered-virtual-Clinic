import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../services/consultationService';
import { patientService } from '../services/patientService';
import { aiService, ComprehensiveAIResult } from '../services/aiService';
import { doctorService } from '../services/doctorService';
import { Consultation, Patient, DoctorNote, DoctorRequest } from '../types';
import { SourceBadge } from '../components/common/SourceBadge';
import { AIAssessmentSummaryCard } from '../components/consultations/AIAssessmentSummaryCard';
import { RiskAssessmentCard } from '../components/consultations/RiskAssessmentCard';
import { DoctorNoteForm } from '../components/doctor/DoctorNoteForm';
import { TeleConsultChat } from '../components/doctor/TeleConsultChat';
import { Button } from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  Image as ImageIcon,
  Stethoscope,
  RefreshCcw,
  CheckCircle2,
  FileCheck,
  Eye,
  MessageSquare,
} from 'lucide-react';

export const DoctorCasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [aiData, setAiData] = useState<ComprehensiveAIResult | null>(null);
  const [docNote, setDocNote] = useState<DoctorNote | undefined>(undefined);
  const [docReq, setDocReq] = useState<DoctorRequest | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rx_form' | 'tele_chat'>('rx_form');

  useEffect(() => {
    async function loadDoctorCase() {
      setIsLoading(true);
      try {
        const c = await consultationService.getConsultationById(id || 'CNS-9021');
        if (c) {
          setConsultation(c);
          const p = await patientService.getPatientById(c.patientId);
          setPatient(p);

          const note = await doctorService.getDoctorNoteByConsultationId(c.id);
          setDocNote(note);

          const req = await doctorService.getDoctorRequestByConsultationId(c.id);
          setDocReq(req);

          const aiRes = await aiService.evaluateConsultation(c);
          setAiData(aiRes);
        }
      } catch (err: any) {
        addToast({
          title: 'Case Loading Error',
          message: err.message || 'Unable to load clinical intake.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctorCase();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium space-y-3">
        <RefreshCcw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-sm">Loading split-pane doctor case workstation...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-4">
        <p>Consultation record not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/doctor/dashboard')}>
          Back to Doctor Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctor/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 shrink-0"
          >
            Dashboard
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">
                Doctor Review: {consultation.patientName} ({consultation.patientAge}Y)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-800 text-indigo-200 font-mono">
                {consultation.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Health Worker: {consultation.healthWorkerName} • Sub-Health Centre Rampur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('tele_chat')}
            leftIcon={<MessageSquare className="w-4 h-4" />}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
          >
            Open Live Tele-Chat
          </Button>
        </div>
      </div>

      {/* Split-Pane Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE (5 cols): Patient Intake, Vitals, OCR Docs, Medical History, Images */}
        <div className="lg:col-span-5 space-y-5">
          {/* Patient Profile Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                Patient Identity & Demographics
              </h3>
              <SourceBadge source="Health Worker Entered" />
            </div>

            <div className="space-y-1 text-xs text-slate-800">
              <p className="text-base font-extrabold text-slate-900">{consultation.patientName}</p>
              <p>
                <strong>Age / Gender:</strong> {consultation.patientAge} Years • {consultation.patientGender}
              </p>
              <p>
                <strong>Location:</strong> Village Rampur, Surguja District
              </p>
              <p>
                <strong>ABHA ID:</strong> {patient?.abhaId || '91-2384-9021-1123'}
              </p>
              <p>
                <strong>Preferred Language:</strong> Hindi / Chhattisgarhi
              </p>
            </div>
          </div>

          {/* Chief Complaint & Vitals */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Intake Vitals & Chief Complaint
              </h3>
              <SourceBadge source="Health Worker Entered" />
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Chief Complaint</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{consultation.chiefComplaint}</p>
              </div>

              {consultation.vitals && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">Blood Pressure</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {consultation.vitals.bpSystolic}/{consultation.vitals.bpDiastolic} mmHg
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-semibold block">SpO2 Oxygen</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {consultation.vitals.spo2Percentage}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Document & OCR Viewer */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Attached Records & OCR Extracted Text
              </h3>
              <SourceBadge source="OCR Extracted" />
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
              <span className="font-bold text-amber-900 block">Lab Discharge Summary (SHC Scan)</span>
              <p className="text-slate-800 leading-relaxed font-mono text-[11px]">
                "Fasting Blood Glucose: 142 mg/dL. HbA1c: 7.8%. Previous prescription Amlodipine 5mg OD confirmed."
              </p>
            </div>
          </div>

          {/* Image Findings Viewer */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Clinical Image Attachments
              </h3>
              <SourceBadge source="Health Worker Entered" />
            </div>

            {consultation.images && consultation.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {consultation.images.map((img) => (
                  <div key={img.id} className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs">
                    <img src={img.url} alt={img.type} className="w-full h-24 object-cover rounded-lg mb-1" />
                    <span className="font-bold text-slate-800 capitalize block truncate">{img.type}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{img.notes}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No clinical image files attached to this consultation.</p>
            )}
          </div>
        </div>

        {/* RIGHT PANE (7 cols): AI Risk Assessment, Prescription Signing Form & Tele-Chat */}
        <div className="lg:col-span-7 space-y-5">
          {/* AI Risk & Assessment Cards */}
          <AIAssessmentSummaryCard assessment={aiData?.assessment} />

          {/* {aiData?.risk && <RiskAssessmentCard risk={aiData.risk} />} */}

          {/* Tabs for Action Workstation: Prescription Form vs Live Tele-Chat */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rx_form')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'rx_form'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Stethoscope className="w-4 h-4 text-blue-700" />
              Prescription & Authorization Form
            </button>

            <button
              onClick={() => setActiveTab('tele_chat')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'tele_chat'
                ? 'bg-white text-teal-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <MessageSquare className="w-4 h-4 text-teal-700" />
              Live Tele-Doctor Chat
            </button>
          </div>

          {/* Workstation Tab Content */}
          {activeTab === 'rx_form' ? (
            <DoctorNoteForm
              consultationId={consultation.id}
              patientName={consultation.patientName}
              existingNote={docNote}
              onNoteSaved={(updatedNote) => {
                setDocNote(updatedNote);
              }}
            />
          ) : (
            <TeleConsultChat
              consultationId={consultation.id}
              currentUserRole="DOCTOR"
              currentUserName="Dr. Rajesh Verma (Senior Consultant)"
            />
          )}
        </div>
      </div>
    </div>
  );
};
