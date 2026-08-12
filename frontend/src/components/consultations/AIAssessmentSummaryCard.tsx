import React from 'react';
import { AIAssessment } from '../../types';
import { SourceBadge } from '../common/SourceBadge';
import { Sparkles, AlertCircle, ShieldAlert, CheckCircle2, HelpCircle, FileSearch } from 'lucide-react';

interface AIAssessmentSummaryCardProps {
  assessment?: AIAssessment;
  isLoading?: boolean;
  isUnavailable?: boolean;
  onRetry?: () => void;
}

export const AIAssessmentSummaryCard: React.FC<AIAssessmentSummaryCardProps> = ({
  assessment,
  isLoading = false,
  isUnavailable = false,
  onRetry,
}) => {
  if (isUnavailable) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="text-base font-bold text-amber-900 tracking-tight">AI Assessment Unavailable</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            Fallback Mode Active
          </span>
        </div>

        <p className="text-xs text-amber-800 leading-relaxed">
          The automated clinical reasoning engine is currently offline or unreachable. Clinical intake data has been safely preserved. Health workers may proceed directly to doctor escalation or manual clinical review without automated preliminary flags.
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-bold text-amber-900 underline hover:text-amber-950 flex items-center gap-1"
          >
            Retry AI Analysis
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-1/3"></div>
          <div className="h-5 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="h-16 bg-slate-100 rounded"></div>
        <div className="h-12 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="p-6 rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50/50 via-white to-slate-50 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Preliminary AI Assessment</h3>
              <SourceBadge source="AI Generated" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Supporting Information • Requires Professional Review • Non-Definitive
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-800 bg-indigo-100/80 px-2.5 py-1 rounded-md border border-indigo-200 self-start sm:self-center">
          Assistance Model Only
        </span>
      </div>

      {/* Primary Narrative Summary */}
      <div className="space-y-2">
        <p className="text-xs text-slate-800 leading-relaxed font-normal bg-white p-3.5 rounded-xl border border-indigo-100/80 shadow-2xs">
          {assessment.summary}
        </p>
      </div>

      {/* Suspected Differential Considerations */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileSearch className="w-3.5 h-3.5 text-indigo-600" />
          Differential Considerations (Requires Doctor Validation)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {assessment.suspectedConditions.map((cond, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-2 shadow-2xs"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">{cond.name}</p>
                <p className="text-[10px] text-slate-500 font-medium capitalize">
                  Priority level: <span className="font-semibold text-slate-700">{cond.urgency}</span>
                </p>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                Consideration
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Red Flags */}
      {assessment.flags && assessment.flags.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
          <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            AI Identified Vital & Symptom Red Flags
          </h5>
          <ul className="space-y-1 pl-5 list-disc text-xs text-amber-800">
            {assessment.flags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Information Section */}
      {assessment.missingInformation && assessment.missingInformation.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span>Missing Information & Incomplete Intake Data</span>
          </div>
          <p className="text-[11px] text-slate-600">
            To prevent overconfidence, the AI assessment highlights these key missing data points:
          </p>
          <ul className="space-y-1 pl-5 list-disc text-xs text-slate-700">
            {assessment.missingInformation.map((info, idx) => (
              <li key={idx}>{info}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Non-Definitive Legal Disclaimer */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-snug">
        <strong>Mandatory Notice:</strong> AI outputs are machine-synthesized preliminary considerations for health worker assistance. This interface does NOT provide a final clinical diagnosis, medical prescription, or definitive therapy plan. All cases require evaluation by a certified tele-doctor or registered medical practitioner.
      </div>
    </div>
  );
};
