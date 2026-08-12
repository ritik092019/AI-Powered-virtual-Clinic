import React from 'react';
import { EmergencyAssessmentResult } from '../../types/emergency';
import { AlertOctagon, ShieldAlert, CheckSquare, AlertTriangle, Stethoscope, Sparkles, Bell, CheckCircle2, Ban } from 'lucide-react';
import { Card } from '../ui/Card';

interface ResultCardProps {
  result: EmergencyAssessmentResult;
  onReset?: () => void;
}

export const EmergencyResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isCritical = result.urgency_level === 'CRITICAL_EMERGENCY';
  const isHigh = result.urgency_level === 'HIGH_PRIORITY';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Urgency Header Card */}
      <div
        className={`p-5 rounded-2xl text-white shadow-lg border-2 flex items-start justify-between gap-4 ${
          isCritical
            ? 'bg-linear-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-500'
            : isHigh
            ? 'bg-linear-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-500'
            : 'bg-linear-to-r from-slate-900 to-indigo-950 border-indigo-500'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`p-3 rounded-xl text-white shrink-0 ${
              isCritical ? 'bg-rose-600 animate-pulse' : isHigh ? 'bg-amber-600' : 'bg-indigo-600'
            }`}
          >
            {isCritical ? <AlertOctagon className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isCritical
                    ? 'bg-rose-900 text-rose-200 border-rose-600'
                    : isHigh
                    ? 'bg-amber-900 text-amber-200 border-amber-600'
                    : 'bg-indigo-900 text-indigo-200 border-indigo-600'
                }`}
              >
                {result.urgency_level.replace('_', ' ')}
              </span>

              {result.high_alert_sent && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 border border-rose-400">
                  <Bell className="w-3 h-3 animate-bounce" /> High Alert Sent To Doctors
                </span>
              )}
            </div>

            <h3 className="text-xl font-black tracking-tight">{result.summary_rationale}</h3>
            <p className="text-xs text-slate-300 mt-1">
              Model: <span className="font-mono text-indigo-300">{result.model_name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Problem Explanation Card */}
      {result.problem_explanation && (
        <Card variant="default" className="p-4 border-indigo-200 bg-indigo-50/40 space-y-1.5">
          <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> 1. Identified Problem Explanation
          </h4>
          <p className="text-xs font-medium leading-relaxed text-slate-800 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
            {result.problem_explanation}
          </p>
        </Card>
      )}

      {/* Solutions to Adapt Card */}
      {result.solutions_to_adapt && result.solutions_to_adapt.length > 0 && (
        <Card variant="default" className="p-4 border-teal-200 bg-teal-50/40">
          <h4 className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" /> 2. Recommended Clinical Solutions to Adapt
          </h4>
          <div className="space-y-1.5">
            {result.solutions_to_adapt.map((sol, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-teal-200 text-xs font-semibold text-teal-950 flex items-start gap-2 shadow-2xs">
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{sol}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Critical Things to Avoid Card */}
      {result.things_to_avoid && result.things_to_avoid.length > 0 && (
        <Card variant="default" className="p-4 border-amber-200 bg-amber-50/40">
          <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <Ban className="w-4 h-4 text-amber-600" /> 3. Critical Actions & Harmful Practices to Avoid
          </h4>
          <div className="space-y-1.5">
            {result.things_to_avoid.map((avoid, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-amber-300 text-xs font-bold text-amber-950 flex items-start gap-2 shadow-2xs">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✕
                </span>
                <span>{avoid}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Immediate First-Aid Checklist */}
      <Card variant="default" className="p-4 border-emerald-200 bg-emerald-50/30">
        <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <CheckSquare className="w-4 h-4 text-emerald-600" /> 4. Immediate First-Aid & Basic Care Actions
        </h4>

        <div className="space-y-2">
          {result.immediate_first_aid.map((action, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-200/80 flex items-start space-x-2.5 text-xs text-slate-800 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="font-semibold leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Red-Flag Critical Warnings */}
      {result.critical_warnings.length > 0 && (
        <Card variant="default" className="p-4 border-rose-200 bg-rose-50/40">
          <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> 5. Red-Flag Clinical Warnings
          </h4>

          <div className="space-y-1.5">
            {result.critical_warnings.map((warning, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Doctor Escalation Status Banner */}
      <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
        result.doctor_escalation_required
          ? 'bg-rose-100 text-rose-950 border-rose-300'
          : 'bg-teal-50 text-teal-900 border-teal-200'
      }`}>
        <div className="flex items-center space-x-2.5">
          <Stethoscope className="w-5 h-5 text-indigo-700 shrink-0" />
          <div>
            <p className="font-black text-sm">
              {result.doctor_escalation_required
                ? 'Immediate Doctor Tele-Consultation Required'
                : 'Standard Routine Protocol Guidance'}
            </p>
            <p className="text-[11px] text-slate-600 font-normal">
              {result.high_alert_sent
                ? 'High alert notification transmitted to district doctor queue.'
                : 'Intake file logged and available in doctor queue.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
