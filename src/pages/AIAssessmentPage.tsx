import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../services/consultationService';
import { patientService } from '../services/patientService';
import { aiService, ComprehensiveAIResult } from '../services/aiService';
import { doctorService } from '../services/doctorService';
import { Consultation, Patient, DoctorRequest, DoctorNote } from '../types';
import { SourceBadge } from '../components/common/SourceBadge';
import { AIAssessmentSummaryCard } from '../components/consultations/AIAssessmentSummaryCard';
import { RiskAssessmentCard } from '../components/consultations/RiskAssessmentCard';
import { ProtocolGuidanceCard } from '../components/consultations/ProtocolGuidanceCard';
import { ConsultationTimeline, TimelineEvent } from '../components/consultations/ConsultationTimeline';
import { DoctorEscalationModal } from '../components/consultations/DoctorEscalationModal';
import { Button } from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  AlertTriangle,
  Stethoscope,
  RefreshCcw,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';

export const AIAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [aiData, setAiData] = useState<ComprehensiveAIResult | null>(null);
  const [existingDoctorReq, setExistingDoctorReq] = useState<DoctorRequest | undefined>(undefined);
  const [existingDoctorNote, setExistingDoctorNote] = useState<DoctorNote | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(true);
  const [isSimulatingError, setIsSimulatingError] = useState(false);
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);

  // Load consultation & run AI evaluation
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const c = await consultationService.getConsultationById(id || 'CNS-9021');
        if (c) {
          setConsultation(c);
          const p = await patientService.getPatientById(c.patientId);
          setPatient(p);

          // Fetch doctor request / note if exists
          const docReq = await doctorService.getDoctorRequestByConsultationId(c.id);
          setExistingDoctorReq(docReq);

          const docNote = await doctorService.getDoctorNoteByConsultationId(c.id);
          setExistingDoctorNote(docNote);

          // Evaluate AI
          const aiRes = await aiService.evaluateConsultation(c, { simulateError: isSimulatingError });
          setAiData(aiRes);
        }
      } catch (err: any) {
        addToast({
          title: 'AI Evaluation Notice',
          message: err.message || 'AI reasoning engine fallback active.',
          type: 'warning',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id, isSimulatingError]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium space-y-3">
        <RefreshCcw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm">Evaluating clinical intake data & synthesizing risk rationale...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-4">
        <p>Consultation record not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/consultations')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  // Construct deterministic timeline events
  const timelineEvents: TimelineEvent[] = [
    {
      id: 'tl_1',
      title: 'Clinical Intake Recorded',
      description: `Chief complaint: "${consultation.chiefComplaint}". Recorded by health worker ${consultation.healthWorkerName}.`,
      timestamp: consultation.createdAt || '10:15 AM',
      author: consultation.healthWorkerName,
      source: 'Health Worker Entered',
      type: 'created',
    },
    {
      id: 'tl_2',
      title: 'AI Preliminary Assessment Synthesized',
      description:
        aiData?.assessment.summary ||
        'Preliminary AI differential considerations and flags generated without error.',
      timestamp: '10:17 AM',
      author: 'Arogya AI Clinical Reasoning Engine',
      source: 'AI Generated',
      type: 'ai_analyzed',
    },
    {
      id: 'tl_3',
      title: 'Risk Categorization Completed',
      description: `Assessed Level: ${aiData?.risk.label || 'Low Priority'}. Rationale: ${
        aiData?.risk.rationale || 'Vital signs stable.'
      }`,
      timestamp: '10:18 AM',
      author: 'Arogya AI Risk Classification Module',
      source: 'AI Generated',
      type: 'risk_assessed',
    },
  ];

  if (existingDoctorReq) {
    timelineEvents.push({
      id: 'tl_4',
      title: 'Tele-Doctor Review Requested',
      description: `Specialty: ${existingDoctorReq.specialtyNeeded}. Requested by ${existingDoctorReq.requestingWorkerName}. Status: ${existingDoctorReq.status}.`,
      timestamp: existingDoctorReq.requestedAt,
      author: existingDoctorReq.requestingWorkerName,
      source: 'Health Worker Entered',
      statusBadge: existingDoctorReq.status,
      type: 'doctor_requested',
    });
  }

  if (existingDoctorNote) {
    timelineEvents.push({
      id: 'tl_5',
      title: 'Doctor Digital Prescription Signed',
      description: `Diagnosis: ${existingDoctorNote.diagnosis}. Signed by ${existingDoctorNote.doctorName}.`,
      timestamp: '11:00 AM',
      author: existingDoctorNote.doctorName,
      source: 'Doctor Entered',
      statusBadge: existingDoctorNote.outcome || 'Completed',
      type: 'note_added',
    });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
              {consultation.id}
            </span>
            <span className="text-xs text-slate-500">
              Intake Date: {consultation.createdAt?.split('T')[0] || 'Today'}
            </span>
            <SourceBadge source="Health Worker Entered" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Intake & AI Assessment Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSimulatingError(!isSimulatingError)}
            leftIcon={<RefreshCcw className="w-3.5 h-3.5" />}
            className="text-slate-600"
          >
            {isSimulatingError ? 'Restore AI Service' : 'Simulate AI Error'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/consultations')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Queue
          </Button>
        </div>
      </div>

      {/* Doctor Action Bar if Tele-Consult active */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Tele-Doctor Consultation & Remote Authorization</h3>
            <p className="text-xs text-slate-300">
              {existingDoctorReq
                ? `Queue Status: ${existingDoctorReq.status.toUpperCase()} (${existingDoctorReq.specialtyNeeded})`
                : 'Case submitted. Health worker can escalate to tele-doctor queue anytime.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/consultations/${consultation.id}/tele-consult`)}
            leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            className="bg-teal-600 hover:bg-teal-700 font-bold text-white"
          >
            Open Remote Tele-Consult Chat
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/doctor/case/${consultation.id}`)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Doctor Case View
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Column Clinical Intake Data, Right Column AI & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 5 cols (Patient Summary, Chief Complaint, Vitals, Meds, Docs, Images) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION 1: Patient Summary */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" />
                Patient Summary
              </h3>
              <SourceBadge source="Health Worker Entered" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-extrabold text-slate-900">{consultation.patientName}</span>
                <span className="text-xs font-bold text-slate-600">
                  {consultation.patientAge} Yrs • {consultation.patientGender}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Village Rampur, Surguja • Health ID: {patient?.abhaId || '91-2384-9021-1123'}
              </p>
            </div>
          </div>

          {/* SECTION 2 & 3: Chief Complaint, Symptoms & Duration */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chief Complaint & Symptoms
              </h3>
              <SourceBadge source="Patient Provided" />
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Chief Complaint</span>
                <p className="text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-0.5">
                  {consultation.chiefComplaint}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Symptom Inventory & Duration</span>
                <div className="space-y-1.5 mt-1">
                  {consultation.symptoms.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-medium capitalize">
                          {s.severity}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">
                        Duration: {s.durationDays || 2} Days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Vital Signs */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Vital Signs Recorded
              </h3>
              <SourceBadge source="Health Worker Entered" />
            </div>

            {consultation.vitals ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Blood Pressure</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {consultation.vitals.bpSystolic}/{consultation.vitals.bpDiastolic} mmHg
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Oxygen Saturation (SpO2)</span>
                  <span
                    className={`text-sm font-extrabold ${
                      consultation.vitals.spo2Percentage && consultation.vitals.spo2Percentage < 94
                        ? 'text-rose-700'
                        : 'text-slate-900'
                    }`}
                  >
                    {consultation.vitals.spo2Percentage}%
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Pulse Rate</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {consultation.vitals.pulseRate} bpm
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block">Temperature</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {consultation.vitals.tempFahrenheit}°F
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Vitals not recorded.</p>
            )}
          </div>

          {/* SECTION 5 & 6: Medical History, Medications & Allergies */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Medical History & Medications
              </h3>
              <SourceBadge source="Patient Provided" />
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Known Conditions</span>
                <p className="text-slate-800 font-medium">
                  {patient?.medicalHistory?.map((m) => m.condition).join(', ') || 'Essential Hypertension, Diabetes'}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Confirmed Medications</span>
                <p className="text-slate-800 font-medium">
                  {patient?.medications?.map((m) => `${m.name} (${m.dosage})`).join(', ') || 'Amlodipine 5mg OD'}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Allergies Logged</span>
                <p className="text-rose-800 font-bold bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-block mt-0.5">
                  {patient?.allergies?.map((a) => `${a.allergen} (${a.reaction})`).join(', ') || 'Penicillin Allergy'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 7 & 8: Document Findings & Image Observations */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Document Findings & OCR Summary
              </h3>
              <SourceBadge source="OCR Extracted" />
            </div>

            <p className="text-xs text-slate-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
              <strong>Extracted Lab/Prescription OCR:</strong> Discharge summary extracted HbA1c 7.8% (Elevated), WBC 8,400/mcL. Previous prescription Amlodipine 5mg OD confirmed.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 7 cols (AI Preliminary Assessment, Missing Info, Risk Assessment, Recommended Next Step, Protocol Guidance, Timeline) */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 9: AI Preliminary Assessment & SECTION 10: Missing Info */}
          <AIAssessmentSummaryCard
            assessment={aiData?.assessment}
            isUnavailable={isSimulatingError}
            onRetry={() => setIsSimulatingError(false)}
          />

          {/* SECTION 11: Risk Assessment & SECTION 12: Recommended Next Step */}
          {aiData?.risk && (
            <RiskAssessmentCard
              risk={aiData.risk}
              isDoctorRequested={!!existingDoctorReq}
              onRequestDoctor={() => setIsEscalationModalOpen(true)}
            />
          )}

          {/* SECTION 13: Protocol Guidance (if low-risk) */}
          {aiData?.protocolGuidance && <ProtocolGuidanceCard guidance={aiData.protocolGuidance} />}

          {/* Existing Doctor Note (If Doctor has signed prescription) */}
          {existingDoctorNote && (
            <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                  <h3 className="text-base font-bold text-blue-950">Tele-Doctor Signed Authorization</h3>
                </div>
                <SourceBadge source="Doctor Entered" />
              </div>

              <div className="space-y-2 text-xs text-slate-800">
                <p>
                  <strong>Signed By:</strong> {existingDoctorNote.doctorName}
                </p>
                <p>
                  <strong>Diagnosis:</strong> {existingDoctorNote.diagnosis}
                </p>
                <div className="p-3 bg-white rounded-xl border border-blue-200 font-mono text-slate-900 whitespace-pre-wrap">
                  <strong>Rx Prescription:</strong>
                  <br />
                  {existingDoctorNote.prescription}
                </div>
                <p>
                  <strong>Advice & Follow-Up:</strong> {existingDoctorNote.advice} (Revisit in{' '}
                  {existingDoctorNote.followUpDays} days)
                </p>
              </div>
            </div>
          )}

          {/* Consultation Audit Timeline */}
          <ConsultationTimeline events={timelineEvents} />
        </div>
      </div>

      {/* Doctor Escalation Confirmation Modal */}
      <DoctorEscalationModal
        isOpen={isEscalationModalOpen}
        onClose={() => setIsEscalationModalOpen(false)}
        consultationId={consultation.id}
        patientName={consultation.patientName}
        patientAge={consultation.patientAge}
        patientGender={consultation.patientGender}
        chiefComplaint={consultation.chiefComplaint}
        priority={consultation.priority}
        escalationReason={aiData?.risk.escalationReason}
        onRequestSubmitted={() => {
          doctorService.getDoctorRequestByConsultationId(consultation.id).then((req) => {
            setExistingDoctorReq(req);
          });
        }}
      />
    </div>
  );
};
