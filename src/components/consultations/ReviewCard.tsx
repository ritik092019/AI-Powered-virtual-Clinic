import React from 'react';
import { ConsultationDraft, Patient } from '../../types';
import {
  UserCheck,
  FileText,
  Activity,
  History,
  Pill,
  HeartPulse,
  Mic,
  FilePlus,
  Camera,
  Edit3,
  CheckCircle2,
  AlertOctagon,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface ReviewCardProps {
  draft: ConsultationDraft;
  patient: Patient | null;
  onNavigateToStep: (stepIndex: number) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ draft, patient, onNavigateToStep }) => {
  return (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-teal-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Comprehensive Clinical Intake Review
          </h3>
          <p className="text-xs text-teal-700">
            Verify all intake details before submitting to the AI Analysis and doctor triage engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* CARD 1: PATIENT INFORMATION */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              1. Patient Information
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                Patient Registry
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(0)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </div>
          </div>

          {patient ? (
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                <span className="text-xs font-semibold text-teal-800">{patient.id}</span>
              </div>
              <p>
                {patient.age} yrs, {patient.gender} • Village: {patient.village}
              </p>
              <p>Phone: {patient.phone} • Language: {patient.preferredLanguage}</p>
              {patient.bloodGroup && <p className="text-rose-700 font-semibold">Blood Group: {patient.bloodGroup}</p>}
            </div>
          ) : (
            <p className="text-rose-600 font-bold">No patient selected!</p>
          )}
        </div>

        {/* CARD 2: CHIEF COMPLAINT & SYMPTOMS */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              2. Chief Complaint & Symptoms
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800">
                Health Worker Entered
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(1)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-500 text-[10px] uppercase block">Chief Complaint:</span>
              <p className="font-medium text-slate-900">{draft.chiefComplaint || 'None provided'}</p>
            </div>

            <div>
              <span className="font-semibold text-slate-500 text-[10px] uppercase block">Assessed Priority:</span>
              <span
                className={`inline-block px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  draft.priority === 'emergency'
                    ? 'bg-rose-100 text-rose-800'
                    : draft.priority === 'urgent'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-teal-100 text-teal-800'
                }`}
              >
                {draft.priority || 'routine'}
              </span>
            </div>

            {draft.symptoms && draft.symptoms.length > 0 && (
              <div>
                <span className="font-semibold text-slate-500 text-[10px] uppercase block">Symptom Breakdown:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {draft.symptoms.map((s) => (
                    <span key={s.id} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">
                      <strong>{s.name}</strong> ({s.duration}, {s.severity})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: VITAL SIGNS */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              3. Vital Signs
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800">
                Health Worker Measured
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(5)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </div>
          </div>

          {draft.vitals ? (
            <div className="grid grid-cols-2 gap-2 text-slate-800">
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                <span className="font-bold">
                  {draft.vitals.bpSystolic && draft.vitals.bpDiastolic
                    ? `${draft.vitals.bpSystolic}/${draft.vitals.bpDiastolic} mmHg`
                    : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-400 block text-[10px]">Temperature</span>
                <span className="font-bold">
                  {draft.vitals.tempFahrenheit ? `${draft.vitals.tempFahrenheit} °F` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-400 block text-[10px]">SpO2 Saturation</span>
                <span className="font-bold">{draft.vitals.spo2Percentage ? `${draft.vitals.spo2Percentage} %` : 'N/A'}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <span className="text-slate-400 block text-[10px]">Pulse Rate</span>
                <span className="font-bold">{draft.vitals.pulseRate ? `${draft.vitals.pulseRate} bpm` : 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 italic">No vitals recorded.</p>
          )}
        </div>

        {/* CARD 4: MEDICATIONS & ALLERGIES */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-600" />
              4. Meds & Allergies
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">
                Patient Confirmed
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(4)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-500 text-[10px] uppercase block">Active Medications:</span>
              {draft.confirmedMedications && draft.confirmedMedications.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {draft.confirmedMedications.map((m) => (
                    <span key={m.id} className="bg-teal-50 text-teal-900 px-2 py-0.5 rounded text-xs font-semibold">
                      {m.name} ({m.dosage})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No active medications.</p>
              )}
            </div>

            <div>
              <span className="font-semibold text-slate-500 text-[10px] uppercase block">Allergy Alerts:</span>
              {draft.noKnownAllergies ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Confirmed: No Known Drug Allergies (NKDA)
                </span>
              ) : draft.confirmedAllergies && draft.confirmedAllergies.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {draft.confirmedAllergies.map((a) => (
                    <span key={a.id} className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded text-xs font-bold">
                      {a.allergen} ({a.reaction})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No allergies specified.</p>
              )}
            </div>
          </div>
        </div>

        {/* CARD 5: VOICE TRANSCRIPT */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Mic className="w-4 h-4 text-teal-600" />
              5. Voice Transcript
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800">
                Voice Transcript
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(6)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </div>
          </div>

          {draft.voiceTranscript ? (
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] block">Confirmed English Translation:</span>
              <p className="bg-purple-50 p-2.5 rounded border border-purple-200 text-purple-950 font-medium">
                {draft.voiceTranscript.confirmedTranscript}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 italic">No voice transcript attached.</p>
          )}
        </div>

        {/* CARD 6: DOCUMENTS & OCR EXTRACTED DATA */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-teal-600" />
              6. Documents & OCR
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">
                OCR Extracted
              </span>
              <Button variant="ghost" size="sm" onClick={() => onNavigateToStep(7)} leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </div>
          </div>

          {draft.documents && draft.documents.length > 0 ? (
            <div className="space-y-2">
              <span className="text-slate-500 font-semibold">{draft.documents.length} File(s) Attached:</span>
              {draft.documents.map((d) => (
                <div key={d.id} className="p-2 bg-slate-50 rounded border border-slate-200">
                  <span className="font-bold block text-slate-800">{d.title}</span>
                  {d.ocrExtractedText && (
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">OCR: {d.ocrExtractedText}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No documents attached.</p>
          )}
        </div>
      </div>
    </div>
  );
};
