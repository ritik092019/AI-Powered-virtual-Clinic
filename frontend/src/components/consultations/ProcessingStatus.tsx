import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RefreshCw, AlertTriangle, ArrowRight, Activity, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface ProcessingStatusProps {
  consultationId?: string;
  isSubmitting: boolean;
  onFinishSubmission: () => void;
}

const AI_STEPS = [
  'Extracting clinical entities & symptom keywords...',
  'Analyzing vital signs against age-adjusted reference ranges...',
  'Processing vernacular speech transcript & OCR reports...',
  'Synthesizing differential considerations & AI triage rationale...',
  'Finalizing consultation packet for doctor review queue...',
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  consultationId,
  isSubmitting,
  onFinishSubmission,
}) => {
  const navigate = useNavigate();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isSubmitting && !isCompleted) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev < AI_STEPS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsCompleted(true);
            onFinishSubmission();
            return prev;
          }
        });
      }, 700);
    }

    return () => clearInterval(interval);
  }, [isSubmitting, isCompleted]);

  return (
    <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-xs max-w-2xl mx-auto space-y-6 text-center">
      {!isCompleted ? (
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI Clinical Analysis & Triage Engine</h3>
            <p className="text-xs text-slate-500 mt-1">
              Processing health worker intake data to generate risk rationale and doctor review summary.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
            <div
              className="bg-teal-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${((activeStepIndex + 1) / AI_STEPS.length) * 100}%` }}
            />
          </div>

          {/* AI Checklist Steps */}
          <div className="space-y-2 text-left max-w-md mx-auto pt-2">
            {AI_STEPS.map((stepText, idx) => {
              const isFinished = idx < activeStepIndex || isCompleted;
              const isCurrent = idx === activeStepIndex && !isCompleted;

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                    isFinished
                      ? 'bg-teal-50/60 border-teal-200 text-teal-900'
                      : isCurrent
                      ? 'bg-white border-teal-600 text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Completed State Banner */
        <div className="space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Submitted Successfully
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
              Consultation Transmitted to Doctor Queue
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Consultation ID <strong className="text-slate-900">{consultationId || 'CNS-9021'}</strong> has been processed.
              AI risk assessment has categorized this intake for tele-doctor authorization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/consultations/${consultationId || 'CNS-9021'}`)}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-teal-700 hover:bg-teal-800 font-bold text-white"
            >
              View AI Assessment & Risk Rationale
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/consultations')}
              leftIcon={<FileText className="w-4 h-4" />}
            >
              View All Consultations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
