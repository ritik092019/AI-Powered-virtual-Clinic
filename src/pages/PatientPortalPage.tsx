import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SourceBadge } from '../components/common/SourceBadge';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { patientService } from '../services/patientService';
import { consultationService } from '../services/consultationService';
import { Patient, Consultation } from '../types';
import { User, Activity, FileText, Pill, ShieldCheck, Stethoscope, Sparkles, Phone, MapPin, Calendar, Heart, Download } from 'lucide-react';

export const PatientPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPatientData() {
      setIsLoading(true);
      try {
        const patientId = user?.patientId || 'PAT-1082';
        const fetchedPatient = await patientService.getPatientById(patientId);
        if (fetchedPatient) setPatient(fetchedPatient);

        const allConsults = await consultationService.getConsultations();
        const patientConsults = allConsults.filter((c) => c.patientId === patientId || c.patientName.includes(user?.name || 'Ramesh'));
        setConsultations(patientConsults);
      } catch (err) {
        console.error('Error loading patient portal data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPatientData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="font-medium text-sm">Loading Your Medical Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-teal-300 shrink-0">
              {user?.name ? user.name.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold">
                  {t('role.patient', 'Patient Portal')}
                </span>
                <span className="text-xs text-teal-200 font-mono">ABHA: {patient?.abhaId || '91-2384-9021-1123'}</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight mt-1">{patient?.name || user?.name || 'Ramesh Patel'}</h1>
              <p className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-3">
                <span>
                  {patient?.age} Yrs • {patient?.gender}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-400" /> Village {patient?.village || 'Rampur'}, {patient?.district || 'Surguja'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" /> Blood Group: {patient?.bloodGroup || 'B+'}
                </span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => window.print()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0 font-semibold"
          >
            Download Digital Health Card
          </Button>
        </div>
      </div>

      <HealthcareSafetyNotice compact />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Consultations & Prescriptions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Consultations */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                {t('nav.consultations', 'My Consultations & Doctor Visits')}
              </CardTitle>
              <CardDescription className="text-xs">
                History of intake consultations conducted by village health workers and reviewed by district tele-doctors.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {consultations.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No consultation records found.</p>
              ) : (
                consultations.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{c.id}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" /> {c.consultationDate} • Health Worker: {c.healthWorkerName}
                        </p>
                      </div>

                      {c.priority && (
                        <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">
                          Priority: {c.priority.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p>
                        <strong>Chief Complaint:</strong> {c.chiefComplaint}
                      </p>

                      {c.vitals && (
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex flex-wrap items-center gap-3 font-mono text-[11px] text-teal-900">
                          <span>BP: {c.vitals.bpSystolic}/{c.vitals.bpDiastolic} mmHg</span>
                          <span>•</span>
                          <span>SpO2: {c.vitals.spo2Percentage}%</span>
                          <span>•</span>
                          <span>Heart Rate: {c.vitals.heartRateBpm} bpm</span>
                          <span>•</span>
                          <span>Temp: {c.vitals.temperatureF}°F</span>
                        </div>
                      )}
                    </div>

                    {/* Doctor Decision & Notes */}
                    {c.doctorReview ? (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                            Official Doctor Diagnosis & Authorization
                          </span>
                          <SourceBadge source="Doctor Authorized" />
                        </div>
                        <p className="font-bold text-emerald-900">{c.doctorReview.confirmedDiagnosis}</p>
                        <p className="text-[11px] text-emerald-800">{c.doctorReview.clinicalAdvice}</p>
                        {c.doctorReview.prescription && c.doctorReview.prescription.length > 0 && (
                          <div className="pt-1 border-t border-emerald-200/80">
                            <span className="font-bold text-[11px] text-emerald-900 block">Prescribed Medications:</span>
                            <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5 mt-0.5">
                              {c.doctorReview.prescription.map((px, i) => (
                                <li key={i}>
                                  <strong>{px.medicationName}</strong> - {px.dosage} ({px.frequency}) for {px.durationDays} days
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1 text-indigo-900">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            AI Triage Differential Assessment
                          </span>
                          <SourceBadge source="AI Suggestion" />
                        </div>
                        <p className="text-[11px] text-indigo-800">
                          {c.aiSummary?.primaryRiskCategory || 'Awaiting doctor review'}. Doctor review pending.
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Medications */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Pill className="w-5 h-5 text-indigo-600" /> Active Prescriptions & Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {patient?.currentMedications && patient.currentMedications.length > 0 ? (
                patient.currentMedications.map((med) => (
                  <div key={med.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <SourceBadge source={med.source || 'Prescription'} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-3">No active medications registered.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Profile Details & Emergency */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-teal-700" /> Patient Demographics & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <strong className="text-slate-900">{patient?.phone || '+91 98234 11223'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Contact:</span>
                  <strong className="text-slate-900 text-right">{patient?.emergencyContact || 'Son (+91 98234 99881)'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Language:</span>
                  <strong className="text-teal-800">{patient?.preferredLanguage || 'Hindi'}</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Known Medical Conditions</span>
                <div className="mt-1.5 space-y-1.5">
                  {patient?.medicalHistory?.map((mh) => (
                    <div key={mh.id} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-semibold text-[11px] flex items-center justify-between">
                      <span>{mh.condition} ({mh.diagnosedYear})</span>
                      <SourceBadge source={mh.source || 'User-Entered'} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
