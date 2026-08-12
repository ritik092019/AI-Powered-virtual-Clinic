import React from 'react';
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
  ClipboardCheck,
  Sparkles,
  Check,
  Save,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface StepDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CONSULTATION_STEPS: StepDefinition[] = [
  {
    id: 'patient',
    title: 'Patient Selection',
    shortTitle: 'Patient',
    description: 'Select existing patient record',
    icon: UserCheck,
  },
  {
    id: 'complaint',
    title: 'Chief Complaint',
    shortTitle: 'Complaint',
    description: 'Primary reason for consultation',
    icon: FileText,
  },
  {
    id: 'symptoms',
    title: 'Symptom Assessment',
    shortTitle: 'Symptoms',
    description: 'Onset, duration & severity',
    icon: Activity,
  },
  {
    id: 'history',
    title: 'Medical History',
    shortTitle: 'History',
    description: 'Past conditions & surgeries',
    icon: History,
  },
  {
    id: 'meds_allergies',
    title: 'Meds & Allergies',
    shortTitle: 'Meds & Allergies',
    description: 'Current drugs & allergy alerts',
    icon: Pill,
  },
  {
    id: 'vitals',
    title: 'Vital Signs',
    shortTitle: 'Vitals',
    description: 'BP, SpO2, Temp, Pulse',
    icon: HeartPulse,
  },
  {
    id: 'voice',
    title: 'Voice Recording',
    shortTitle: 'Voice',
    description: 'Vernacular audio transcript',
    icon: Mic,
  },
  {
    id: 'documents',
    title: 'Documents & OCR',
    shortTitle: 'Docs & OCR',
    description: 'Prescriptions & lab reports',
    icon: FilePlus,
  },
  {
    id: 'images',
    title: 'Clinical Images',
    shortTitle: 'Images',
    description: 'Skin, injury or throat photos',
    icon: Camera,
  },
  {
    id: 'review',
    title: 'Review Summary',
    shortTitle: 'Review',
    description: 'Confirm all intake details',
    icon: ClipboardCheck,
  },
  {
    id: 'submit',
    title: 'AI Analysis & Triage',
    shortTitle: 'Submit AI',
    description: 'Generate clinical summary',
    icon: Sparkles,
  },
];

interface ConsultationStepperProps {
  currentStepIndex: number;
  completedSteps: number[];
  onStepClick: (stepIndex: number) => void;
  onSaveDraft?: () => void;
  lastSavedAt?: string;
  isSavingDraft?: boolean;
}

export const ConsultationStepper: React.FC<ConsultationStepperProps> = ({
  currentStepIndex,
  completedSteps,
  onStepClick,
  onSaveDraft,
  lastSavedAt,
  isSavingDraft,
}) => {
  const currentStep = CONSULTATION_STEPS[currentStepIndex];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header bar with title, draft save status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Step {currentStepIndex + 1} of {CONSULTATION_STEPS.length}
            </span>
            <h2 className="text-lg font-bold text-slate-900">{currentStep.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{currentStep.description}</p>
        </div>

        <div className="flex items-center gap-2">
          {lastSavedAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Draft saved at {lastSavedAt}</span>
            </div>
          )}

          {onSaveDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              isLoading={isSavingDraft}
              leftIcon={<Save className="w-3.5 h-3.5 text-teal-600" />}
            >
              Save Draft
            </Button>
          )}
        </div>
      </div>

      {/* Desktop / Tablet Horizontal Scrollable Stepper */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex items-center min-w-[850px] justify-between">
          {CONSULTATION_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(idx);
            const isCurrent = currentStepIndex === idx;
            const isClickable = isCompleted || idx <= Math.max(...completedSteps, 0) + 1;

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(idx)}
                  className={`flex flex-col items-center group focus:outline-none transition-all ${
                    !isClickable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-teal-600 text-white font-bold ring-2 ring-teal-600/30'
                        : isCurrent
                        ? 'bg-teal-50 text-teal-700 border-2 border-teal-600 shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 group-hover:border-slate-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <span
                    className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                      isCurrent ? 'text-teal-800 font-semibold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.shortTitle}
                  </span>
                </button>

                {/* Connector Line */}
                {idx < CONSULTATION_STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-1 rounded-full transition-colors ${
                      completedSteps.includes(idx) ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
