import React from 'react';
import { ProtocolGuidance } from '../../types';
import { SourceBadge } from '../common/SourceBadge';
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Activity,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

interface ProtocolGuidanceCardProps {
  guidance?: ProtocolGuidance;
}

export const ProtocolGuidanceCard: React.FC<ProtocolGuidanceCardProps> = ({ guidance }) => {
  if (!guidance) return null;

  return (
    <div className="p-6 rounded-2xl border border-teal-200 bg-linear-to-br from-teal-50/60 via-white to-slate-50 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Protocol-Based Basic Guidance</h3>
              <SourceBadge source="AI Generated" />
            </div>
            <p className="text-[11px] text-teal-800 font-medium">
              Standard Rural Primary Care First-Aid Protocol • Non-Prescription
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 self-start sm:self-center">
          Demonstration Content Only
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
        {guidance.title}
      </p>

      {/* Grid of 5 Structured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. What to Do */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
          <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            What to Do
          </h4>
          <ul className="space-y-1.5 text-xs text-emerald-950 pl-5 list-disc">
            {guidance.whatToDo.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 2. What to Avoid */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
          <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-600" />
            What to Avoid
          </h4>
          <ul className="space-y-1.5 text-xs text-rose-950 pl-5 list-disc">
            {guidance.whatToAvoid.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 3. What to Monitor */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
          <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-blue-600" />
            What to Monitor
          </h4>
          <ul className="space-y-1.5 text-xs text-blue-950 pl-5 list-disc">
            {guidance.whatToMonitor.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 4. Warning Signs */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
          <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Warning Signs
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-950 pl-5 list-disc">
            {guidance.warningSigns.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. When to Seek Professional Help */}
      <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2">
        <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          When to Seek Professional Medical Help
        </h4>
        <ul className="space-y-1.5 text-xs text-indigo-950 pl-5 list-disc">
          {guidance.whenToSeekHelp.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">Safety Notice:</strong> {guidance.disclaimer}
        </div>
      </div>
    </div>
  );
};
