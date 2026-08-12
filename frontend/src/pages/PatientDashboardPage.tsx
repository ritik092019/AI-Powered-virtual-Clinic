import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SourceBadge } from '../components/common/SourceBadge';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { RegionalVoiceAssistantModal } from '../components/common/RegionalVoiceAssistantModal';
import { EmergencySOSModal } from '../components/common/EmergencySOSModal';
import { EmergencyViewModal } from '../components/emergency/EmergencyViewModal';
import { PersonalAIHealthSummaryModal } from '../components/common/PersonalAIHealthSummaryModal';
import { PatientDoctorConsultationSection } from '../components/patients/PatientDoctorConsultationSection';
import { FamilyTrustedContactSection } from '../components/patients/FamilyTrustedContactSection';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { patientService } from '../services/patientService';
import { consultationService } from '../services/consultationService';
import { Patient, Consultation, Appointment, MedicalDocument } from '../types';
import { MOCK_APPOINTMENTS } from '../mock';
import {
  User,
  Activity,
  FileText,
  Pill,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Download,
  Plus,
  Clock,
  AlertCircle,
  QrCode,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
  ChevronRight,
  ShieldAlert,
  Mic,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { addToast } = useNotification();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isEmergencySOSOpen, setIsEmergencySOSOpen] = useState(false);
  const [isEmergencyRapidViewOpen, setIsEmergencyRapidViewOpen] = useState(false);
  const [isHealthSummaryOpen, setIsHealthSummaryOpen] = useState(false);
  const [newAptType, setNewAptType] = useState<'tele_consultation' | 'in_person_visit'>('tele_consultation');
  const [newAptDoctorSpecialty, setNewAptDoctorSpecialty] = useState('General Physician / Family Doctor');
  const [newAptSeverity, setNewAptSeverity] = useState('Moderate');
  const [newAptLanguage, setNewAptLanguage] = useState('Hindi');
  const [newAptAttachReports, setNewAptAttachReports] = useState(true);
  const [newAptDate, setNewAptDate] = useState('2026-08-20');
  const [newAptTime, setNewAptTime] = useState('11:00 AM');
  const [newAptComplaint, setNewAptComplaint] = useState('');

  // Tab selection
  const [activeTab, setActiveTab] = useState<'overview' | 'doctor_consultation' | 'history' | 'appointments' | 'documents'>('overview');

  useEffect(() => {
    async function loadPatientDashboard() {
      setIsLoading(true);
      try {
        const patientId = user?.patientId || 'PAT-1082';
        const fetchedPatient = await patientService.getPatientById(patientId);
        if (fetchedPatient) {
          setPatient(fetchedPatient);
          if (fetchedPatient.documents) {
            setDocuments(fetchedPatient.documents);
          }
        }

        const allConsults = await consultationService.getConsultations();
        const patientConsults = allConsults.filter(
          (c) => c.patientId === patientId || c.patientName.includes(user?.name || 'Ramesh')
        );
        setConsultations(patientConsults);

        // Fallback mock documents if none attached
        if (!fetchedPatient?.documents || fetchedPatient.documents.length === 0) {
          setDocuments([
            {
              id: 'doc-pat-01',
              patientId: patientId,
              title: 'Quarterly Blood Glucose & HbA1c Lab Report',
              category: 'lab_report',
              uploadedAt: '2026-08-01',
              fileUrl: '#',
              fileSize: '1.2 MB',
              ocrStatus: 'completed',
              ocrSummary: 'Fasting Blood Sugar: 138 mg/dL, HbA1c: 7.2%. Mild elevation.',
            },
            {
              id: 'doc-pat-02',
              patientId: patientId,
              title: 'Sub-Health Centre Prescription Slip',
              category: 'prescription',
              uploadedAt: '2026-08-10',
              fileUrl: '#',
              fileSize: '840 KB',
              ocrStatus: 'completed',
              ocrSummary: 'Amlodipine 5mg OD x 30 days, Metformin 500mg BD x 30 days.',
            },
          ]);
        }
      } catch (err) {
        console.error('Error fetching patient dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadPatientDashboard();
  }, [user]);

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAptComplaint.trim()) {
      addToast({
        title: 'Form Incomplete',
        message: 'Please describe the reason or symptom for your appointment request.',
        type: 'warning',
      });
      return;
    }

    const newApt: Appointment = {
      id: `APT-2026-0${appointments.length + 1}`,
      patientId: user?.patientId || 'PAT-1082',
      patientName: user?.name || 'Ramesh Patel',
      doctorName: newAptType === 'tele_consultation' ? `Dr. Rajesh Verma (${newAptDoctorSpecialty})` : 'Anita Sharma (ANM)',
      doctorSpecialty: newAptDoctorSpecialty,
      facilityName: newAptType === 'tele_consultation' ? 'District Telemedicine Hub' : 'Sub-Health Centre Village Rampur',
      date: newAptDate,
      time: newAptTime,
      type: newAptType,
      status: 'scheduled',
      chiefComplaint: newAptComplaint,
      notes: `Consultation details: Severity [${newAptSeverity}], Language [${newAptLanguage}], Attach Reports [${newAptAttachReports ? 'Yes' : 'No'}]. Submitted via Portal.`,
    };

    setAppointments([newApt, ...appointments]);
    setIsBookingOpen(false);
    setNewAptComplaint('');
    addToast({
      title: 'Appointment Requested',
      message: `Your appointment request for ${newAptDate} at ${newAptTime} has been submitted.`,
      type: 'success',
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="font-medium text-sm">Loading Your Personal Health Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ABHA Digital Health Card Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 rounded-2xl shadow-md space-y-4 border border-teal-800/40 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-800/60 border border-teal-400/30 flex items-center justify-center font-black text-2xl text-teal-300 shrink-0 shadow-inner">
              {user?.name ? user.name.charAt(0) : 'R'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  {t('role.patient', 'Patient Self-Service Access')}
                </span>
                <span className="text-xs text-teal-200 font-mono flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-teal-400" /> ABHA ID: {patient?.abhaId || '91-2384-9021-1123'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-white">
                Namaste, {patient?.name || user?.name || 'Ramesh Patel'}
              </h1>

              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>
                  {patient?.age || 54} Yrs • {patient?.gender || 'Male'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-teal-200">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" /> Village {patient?.village || 'Rampur'}, {patient?.district || 'Surguja'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-rose-300">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Blood Group: {patient?.bloodGroup || 'B+'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-teal-300 animate-spin" />}
              onClick={() => setIsHealthSummaryOpen(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shrink-0 text-xs shadow-lg border border-teal-300"
            >
              ✨ Generate My Health Summary
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsEmergencySOSOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black shrink-0 text-xs shadow-lg animate-pulse border border-rose-400"
            >
              🆘 EMERGENCY SOS
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Mic className="w-4 h-4 text-amber-300 animate-pulse" />}
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="bg-amber-400/20 border-amber-400/40 text-amber-200 hover:bg-amber-400/30 font-bold shrink-0 text-xs"
            >
              Regional Voice Assistant 🎤
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={() => window.print()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold shrink-0 text-xs"
            >
              Download ABHA Health Card
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsBookingOpen(true)}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shrink-0 text-xs shadow-md"
            >
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Assigned Health Worker Info Strip */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-teal-200 gap-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-400" />
            <span>Assigned Health Worker: <strong>Anita Sharma (ANM)</strong></span>
            <span className="text-teal-400 font-mono">• Sub-Health Centre Rampur</span>
          </div>
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1 text-teal-300 hover:text-white transition-colors font-semibold bg-white/10 px-2.5 py-1 rounded-md"
          >
            <Phone className="w-3.5 h-3.5 text-teal-400" /> +91 98765 43210
          </a>
        </div>
      </div>

      <HealthcareSafetyNotice compact />

      {/* Quick Vitals Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Blood Pressure</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-mono">148/92</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Monitored
            </span>
          </div>
          <p className="text-[11px] text-slate-400">mmHg • Measured Aug 12</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Fasting Glucose</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-mono">138</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Managed
            </span>
          </div>
          <p className="text-[11px] text-slate-400">mg/dL • Measured Aug 01</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Blood Oxygen (SpO2)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-teal-900 font-mono">97%</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Normal
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Room Air • Aug 12</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Heart Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 font-mono">78</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Normal
            </span>
          </div>
          <p className="text-[11px] text-slate-400">bpm • Measured Aug 12</p>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-sm font-semibold flex-wrap">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'overview'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          Portal Overview
        </button>
        <button
          onClick={() => setActiveTab('doctor_consultation')}
          className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'doctor_consultation'
              ? 'border-purple-600 text-purple-900 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Stethoscope className="w-4 h-4 text-purple-600" />
          Doctor Consultations & Advice
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'history'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          My Medical History & Medications
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'appointments'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          Upcoming Appointments ({appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-2.5 px-3 border-b-2 transition-colors ${activeTab === 'documents'
              ? 'border-teal-600 text-teal-800 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          Health Documents & Lab Reports ({documents.length})
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Family & Trusted Emergency Contacts Section */}
          <FamilyTrustedContactSection />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (8 cols): Appointments & Latest Doctor Notes */}
            <div className="lg:col-span-8 space-y-6">
              {/* Next Scheduled Appointment Card */}
              <Card variant="default">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-5 h-5 text-teal-700" /> Next Scheduled Visit / Tele-Consult
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setIsBookingOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {appointments.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No upcoming appointments scheduled.</p>
                  ) : (
                    appointments
                      .filter((a) => a.status === 'scheduled' || a.status === 'confirmed')
                      .slice(0, 2)
                      .map((apt) => (
                        <div key={apt.id} className="p-4 rounded-xl border border-teal-200/80 bg-teal-50/40 space-y-3 mb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/60 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                              <span className="text-xs text-slate-500">({apt.doctorSpecialty})</span>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200">
                              {apt.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                              <span>Date: <strong>{apt.date}</strong> at <strong>{apt.time}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-700">
                              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                              <span>Facility: <strong>{apt.facilityName}</strong></span>
                            </div>
                          </div>

                          {apt.chiefComplaint && (
                            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-teal-100">
                              <strong>Reason:</strong> {apt.chiefComplaint}
                            </p>
                          )}
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>

              {/* Doctor Consultation History & Prescriptions */}
              <Card variant="default">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Stethoscope className="w-5 h-5 text-indigo-700" /> Recent Doctor Diagnoses & Advice
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {consultations.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3 text-center">No consultation records on file.</p>
                ) : (
                  consultations.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{c.id}</span>
                          <p className="text-[11px] text-slate-500">Date: {c.createdAt} • Health Worker: {c.healthWorkerName}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>

                      <div className="text-xs text-slate-800 space-y-1">
                        <p><strong>Chief Complaint:</strong> {c.chiefComplaint}</p>
                      </div>

                      {c.doctorReview ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Doctor Authorized Diagnosis
                            </span>
                            <SourceBadge source="Doctor Authorized" />
                          </div>
                          <p className="font-bold text-emerald-900">{c.doctorReview.confirmedDiagnosis}</p>
                          <p className="text-[11px] text-emerald-800">{c.doctorReview.clinicalAdvice}</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs">
                          <p className="font-semibold text-amber-900">Pending Tele-Doctor Authorization</p>
                          <p className="text-[11px] text-amber-800">Your intake details have been logged by Anita Sharma (ANM) and queued for specialist doctor review.</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (4 cols): Active Medications & Allergies */}
          <div className="lg:col-span-4 space-y-6">
            <Card variant="default">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Pill className="w-4 h-4 text-teal-700" /> Active Prescribed Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                {patient?.medications && patient.medications.length > 0 ? (
                  patient.medications.map((med) => (
                    <div key={med.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-xs">{med.name}</p>
                        <SourceBadge source={med.source || 'Prescription'} />
                      </div>
                      <p className="text-[11px] text-slate-600">Dosage: {med.dosage} • Frequency: {med.frequency}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2">No active medications registered.</p>
                )}
              </CardContent>
            </Card>

            <Card variant="default">
              <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Known Allergies & Sensitivities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-0.5">
                  <p className="font-bold text-rose-900">Penicillin Group</p>
                  <p className="text-[11px] text-rose-800">Reaction: Severe skin rash & swelling</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 font-bold text-[10px]">
                    SEVERE
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )}

      {/* TAB CONTENT: DOCTOR CONSULTATION & ADVICE */}
      {activeTab === 'doctor_consultation' && <PatientDoctorConsultationSection />}

      {/* TAB CONTENT: MEDICAL HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-5 h-5 text-teal-700" /> Medical Conditions & History
              </CardTitle>
              <CardDescription className="text-xs">
                Verified chronic conditions, past clinical diagnoses, and health worker intake records.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {patient?.medicalHistory?.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.condition}</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">Diagnosed: Year {item.diagnosedYear || '2021'} • {item.notes}</p>
                  </div>
                  <SourceBadge source={item.source || 'Clinical Log'} />
                </div>
              ))}

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Vaccination & Immunization Record</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between">
                    <span>COVID-19 Precautionary Dose</span>
                    <span className="font-bold text-[10px]">Completed (2025)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between">
                    <span>Tetanus Toxoid Booster</span>
                    <span className="font-bold text-[10px]">Completed (2024)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Scheduled Appointments & Visits</h3>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsBookingOpen(true)}
            >
              Request New Appointment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <Card key={apt.id} variant="default" className="p-4 space-y-3 border-teal-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-mono font-bold text-teal-800">{apt.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${apt.status === 'scheduled' || apt.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                    {apt.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{apt.doctorName}</h4>
                  <p className="text-xs text-slate-500">{apt.doctorSpecialty}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Date: <strong>{apt.date}</strong> at <strong>{apt.time}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Facility: <strong>{apt.facilityName}</strong></span>
                  </p>
                  {apt.chiefComplaint && (
                    <p className="pt-1 text-[11px] text-slate-600 border-t border-slate-200 mt-1">
                      <strong>Complaint:</strong> {apt.chiefComplaint}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileSpreadsheet className="w-5 h-5 text-teal-700" /> Personal Health Documents & Lab Reports
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Digitized prescriptions, lab test results, and health worker clinical attachments.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{doc.title}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                        {doc.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">Uploaded: {doc.uploadedAt} • Size: {doc.fileSize || '1 MB'}</p>
                    {doc.ocrSummary && (
                      <p className="p-2 rounded bg-teal-50/60 border border-teal-100 text-teal-900 text-[11px] mt-1">
                        <strong>OCR Summary:</strong> {doc.ocrSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="xs" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => window.print()}>
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* BOOK APPOINTMENT MODAL */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Request Doctor Appointment</h3>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAptType('tele_consultation')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${newAptType === 'tele_consultation'
                        ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                  >
                    Tele-Doctor Call
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAptType('in_person_visit')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${newAptType === 'in_person_visit'
                        ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                  >
                    Sub-Center Visit
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Specialty</label>
                <select
                  value={newAptDoctorSpecialty}
                  onChange={(e) => setNewAptDoctorSpecialty(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-xs font-semibold"
                >
                  <option value="General Physician / Family Doctor">General Physician / Family Doctor</option>
                  <option value="Cardiologist (Heart Specialist)">Cardiologist (Heart Specialist)</option>
                  <option value="Pulmonologist (Chest & Respiratory)">Pulmonologist (Chest & Respiratory)</option>
                  <option value="Diabetologist / Endocrinologist">Diabetologist / Endocrinologist</option>
                  <option value="Pediatrician (Child Specialist)">Pediatrician (Child Specialist)</option>
                  <option value="Gynecologist / Maternal Specialist">Gynecologist / Maternal Specialist</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Symptom Severity</label>
                  <select
                    value={newAptSeverity}
                    onChange={(e) => setNewAptSeverity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-xs font-medium"
                  >
                    <option value="Mild (Routine Checkup)">Mild (Routine Checkup)</option>
                    <option value="Moderate (Persistent Symptoms)">Moderate (Persistent Symptoms)</option>
                    <option value="Urgent (Acute Pain / High Fever)">Urgent (Acute Pain / High Fever)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Language</label>
                  <select
                    value={newAptLanguage}
                    onChange={(e) => setNewAptLanguage(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none text-xs font-medium"
                  >
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={newAptDate}
                    onChange={(e) => setNewAptDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time</label>
                  <select
                    value={newAptTime}
                    onChange={(e) => setNewAptTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  >
                    <option value="09:30 AM">09:30 AM (Morning)</option>
                    <option value="11:00 AM">11:00 AM (Morning)</option>
                    <option value="02:30 PM">02:30 PM (Afternoon)</option>
                    <option value="04:00 PM">04:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Symptoms</label>
                <textarea
                  rows={3}
                  placeholder="Describe your current symptoms or reason for consult..."
                  value={newAptComplaint}
                  onChange={(e) => setNewAptComplaint(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-950">Auto-Attach Scanned Medical Reports & Prescriptions to Doctor</span>
                <input
                  type="checkbox"
                  checked={newAptAttachReports}
                  onChange={(e) => setNewAptAttachReports(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsBookingOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regional Language Voice Assistant Modal */}
      <RegionalVoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
      />

      {/* Emergency SOS Response Screen */}
      <EmergencySOSModal
        isOpen={isEmergencySOSOpen}
        onClose={() => setIsEmergencySOSOpen(false)}
        patient={patient}
      />

      {/* Personal AI Health Summary Modal */}
      <PersonalAIHealthSummaryModal
        isOpen={isHealthSummaryOpen}
        onClose={() => setIsHealthSummaryOpen(false)}
        patient={patient}
      />

      {/* Rapid Emergency Intake & Doctor High Alert Modal */}
      <EmergencyViewModal
        isOpen={isEmergencyRapidViewOpen}
        onClose={() => setIsEmergencyRapidViewOpen(false)}
      />
    </div>
  );
};

export const PatientDashboardPage = PatientDashboard;
