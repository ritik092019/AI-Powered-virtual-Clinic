import React, { useState } from 'react';
import { EmergencyAssessmentPayload, EmergencyAssessmentResult } from '../../types/emergency';
import { emergencyService } from '../../services/emergencyService';
import { EmergencyCameraCapture } from './EmergencyCameraCapture';
import { EmergencyQuickInput } from './EmergencyQuickInput';
import { EmergencyResultCard } from './EmergencyResultCard';
import { useNotification } from '../../context/NotificationContext';
import { X, ShieldAlert, Sparkles, RefreshCcw, Send, AlertOctagon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmergencyViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyViewModal: React.FC<EmergencyViewModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useNotification();

  const [formData, setFormData] = useState<EmergencyAssessmentPayload>({
    symptoms: [],
    vitals: {},
    high_alert_toggled: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<EmergencyAssessmentResult | null>(null);

  if (!isOpen) return null;

  const handleAssessmentSubmit = async () => {
    if (!formData.symptoms.length && !formData.image_base64 && !formData.injury_description) {
      addToast({
        title: 'Input Required',
        message: 'Please snap/upload a photo, select symptoms, or enter a brief description.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await emergencyService.assessEmergency(formData);
      setAssessmentResult(res);

      if (res.high_alert_sent) {
        addToast({
          title: '🔴 HIGH ALERT DISPATCHED',
          message: 'Instant emergency alert sent to all online tele-doctors via WebSocket.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'Gemini AI Assessment Complete',
          message: 'Emergency triage first-aid steps generated.',
          type: 'success',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'Assessment Error',
        message: err?.response?.data?.message || err.message || 'Failed to complete emergency assessment.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ symptoms: [], vitals: {}, high_alert_toggled: false });
    setAssessmentResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-rose-500 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-rose-950 via-rose-900 to-rose-950 text-white flex items-center justify-between shrink-0 border-b border-rose-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-600/40 text-rose-200 border border-rose-500/50 animate-pulse">
              <AlertOctagon className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  RAPID EMERGENCY VIEW
                </span>
                <span className="text-[10px] text-rose-200 font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" /> Gemini AI Triage
                </span>
              </div>
              <h2 className="text-xl font-black text-white">Emergency Intake & Instant High Alert</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-rose-900/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {assessmentResult ? (
            <EmergencyResultCard result={assessmentResult} />
          ) : (
            <>
              {/* Photo Capture Section */}
              <EmergencyCameraCapture
                onImageCaptured={(base64) => setFormData((prev) => ({ ...prev, image_base64: base64 }))}
              />

              {/* Minimal Quick Form Section */}
              <EmergencyQuickInput formData={formData} onChange={setFormData} />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {assessmentResult ? (
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              leftIcon={<RefreshCcw className="w-4 h-4" />}
            >
              Assess Another Emergency
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          )}

          {!assessmentResult && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAssessmentSubmit}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              className={`font-black text-white shadow-lg transition-all ${
                formData.high_alert_toggled
                  ? 'bg-rose-600 hover:bg-rose-700 text-sm px-6 py-2.5 animate-pulse'
                  : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              {formData.high_alert_toggled
                ? '🔴 Submit & Broadcast High Alert'
                : 'Submit for Gemini AI Assessment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
