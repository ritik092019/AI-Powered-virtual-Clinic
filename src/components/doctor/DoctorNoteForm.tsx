import React, { useState } from 'react';
import { DoctorNote } from '../../types';
import { doctorService } from '../../services/doctorService';
import { consultationSocketService } from '../../services/consultationSocketService';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../ui/Button';
import { SourceBadge } from '../common/SourceBadge';
import { Stethoscope, FileText, CheckCircle2, ShieldCheck, AlertOctagon, Send } from 'lucide-react';

interface DoctorNoteFormProps {
  consultationId: string;
  patientName: string;
  existingNote?: DoctorNote;
  onNoteSaved: (note: DoctorNote) => void;
}

export const DoctorNoteForm: React.FC<DoctorNoteFormProps> = ({
  consultationId,
  patientName,
  existingNote,
  onNoteSaved,
}) => {
  const { addToast } = useNotification();
  const [diagnosis, setDiagnosis] = useState(existingNote?.diagnosis || '');
  const [prescription, setPrescription] = useState(existingNote?.prescription || '');
  const [advice, setAdvice] = useState(existingNote?.advice || '');
  const [followUpDays, setFollowUpDays] = useState(existingNote?.followUpDays || 3);
  const [outcome, setOutcome] = useState<'completed' | 'referred' | 'follow_up_recommended'>(
    existingNote?.outcome || 'completed'
  );
  const [referralCenter, setReferralCenter] = useState(existingNote?.referralCenter || 'District Hospital Ambikapur');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim() || !prescription.trim()) {
      addToast({
        title: 'Missing Required Fields',
        message: 'Please enter clinical diagnosis and prescription instructions.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const note = await doctorService.submitDoctorNote(consultationId, {
        doctorName: 'Dr. Rajesh Verma (Senior Consultant)',
        diagnosis,
        prescription,
        advice,
        followUpDays,
        outcome,
        referralCenter: outcome === 'referred' ? referralCenter : undefined,
      });

      consultationSocketService.triggerConsultationCompleted({ consultationId, note });

      addToast({
        title: 'Doctor Authorization Complete',
        message: `Signed prescription for ${patientName} generated and transmitted to Sub-Health Centre.`,
        type: 'success',
      });

      onNoteSaved(note);
    } catch (err: any) {
      addToast({
        title: 'Submission Error',
        message: err.message || 'Failed to submit doctor note.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-blue-200 bg-white shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Doctor Tele-Consultation Authorization</h3>
              <SourceBadge source="Doctor Entered" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Official Medical Officer Digital Signature & Prescription
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-center">
          Verified Medical Officer Input
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Outcome Selector Buttons */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Consultation Outcome Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setOutcome('completed')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                outcome === 'completed'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Completed & Prescribed
            </button>

            <button
              type="button"
              onClick={() => setOutcome('referred')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                outcome === 'referred'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              Recommend Urgent Referral
            </button>

            <button
              type="button"
              onClick={() => setOutcome('follow_up_recommended')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                outcome === 'follow_up_recommended'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Follow-Up Recommended
            </button>
          </div>
        </div>

        {/* If Referred: Target Referral Facility */}
        {outcome === 'referred' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <label className="block text-xs font-bold text-rose-900">Target Referral Health Facility</label>
            <input
              type="text"
              value={referralCenter}
              onChange={(e) => setReferralCenter(e.target.value)}
              placeholder="e.g. District Hospital Ambikapur - Special Care Ward"
              className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white font-medium"
            />
          </div>
        )}

        {/* Clinical Diagnosis */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Clinical Diagnosis & Summary <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Confirmed Acute Lower Respiratory Tract Infection / CAP with Mild Hypoxia."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-medium"
            required
          />
        </div>

        {/* Rx Prescription */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Rx Digital Prescription & Dosage <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            placeholder="1. Tab. Amoxicillin-Clavulanate 625mg BD x 5 days&#10;2. Syrup Paracetamol 10ml TID PRN fever"
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
            required
          />
        </div>

        {/* Patient Instructions & Advice */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Patient Instructions & Advice</label>
          <textarea
            rows={2}
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="e.g. Maintain fluid intake. Re-check SpO2 in 4 hours. Revisit if shortness of breath increases."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Follow Up Days */}
        <div className="flex items-center gap-3">
          <div className="w-1/2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Follow-Up Revisit (Days)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={followUpDays}
              onChange={(e) => setFollowUpDays(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div className="w-1/2 pt-5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold"
            >
              {isSubmitting ? 'Signing Prescription...' : 'Sign & Complete Consultation'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
