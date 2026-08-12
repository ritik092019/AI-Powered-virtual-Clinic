import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Stethoscope, AlertTriangle, CheckCircle2, Clock, X, ShieldAlert } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { consultationSocketService } from '../../services/consultationSocketService';
import { useNotification } from '../../context/NotificationContext';

interface DoctorEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  chiefComplaint: string;
  priority: 'routine' | 'urgent' | 'emergency';
  escalationReason?: string;
  onRequestSubmitted: (requestId: string) => void;
}

const SPECIALTIES = [
  'General Medicine / Tele-Consultant',
  'Pulmonology / Chest Specialist',
  'Cardiology Specialist',
  'Pediatrics / Child Care',
  'Obstetrics & Gynecology (ANC)',
];

export const DoctorEscalationModal: React.FC<DoctorEscalationModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  patientAge,
  patientGender,
  chiefComplaint,
  priority,
  escalationReason,
  onRequestSubmitted,
}) => {
  const { addToast } = useNotification();
  const [selectedSpecialty, setSelectedSpecialty] = useState(SPECIALTIES[0]);
  const [escalationNotes, setEscalationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmEscalation = async () => {
    setIsSubmitting(true);
    try {
      const created = await doctorService.createDoctorRequest({
        consultationId,
        patientName: `${patientName} (${patientAge}${patientGender.charAt(0)})`,
        requestingWorkerName: 'Anita Sharma (ANM Rampur)',
        specialtyNeeded: selectedSpecialty,
        priority,
        notes: escalationNotes || escalationReason || 'Elevated risk parameters flagged for doctor authorization.',
      });

      // Trigger socket event
      consultationSocketService.triggerDoctorRequestCreated(created);

      addToast({
        title: 'Doctor Request Submitted',
        message: `Consultation ${consultationId} added to District Hospital tele-doctor queue.`,
        type: 'success',
      });

      onRequestSubmitted(created.id);
      onClose();
    } catch (err: any) {
      addToast({
        title: 'Escalation Failed',
        message: err.message || 'Unable to queue doctor request.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Tele-Doctor Escalation</h3>
              <p className="text-xs text-slate-500">Queue case for remote doctor authorization</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-900">
              {patientName} ({patientAge}{patientGender.charAt(0)})
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase ${
                priority === 'emergency'
                  ? 'bg-rose-100 text-rose-800'
                  : priority === 'urgent'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {priority}
            </span>
          </div>

          <p className="text-slate-700">
            <strong>Chief Complaint:</strong> {chiefComplaint}
          </p>

          {escalationReason && (
            <p className="text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 font-medium">
              <strong>Escalation Rationale:</strong> {escalationReason}
            </p>
          )}
        </div>

        {/* Form Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Specialty Required</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 font-medium"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Health Worker Escalation Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              placeholder="Add specific observations or questions for tele-doctor..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmEscalation}
            disabled={isSubmitting}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
            leftIcon={<Stethoscope className="w-4 h-4" />}
          >
            {isSubmitting ? 'Transmitting Request...' : 'Confirm Request to Doctor Queue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
