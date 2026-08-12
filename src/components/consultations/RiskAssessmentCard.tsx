import React from 'react';
import { RiskAssessment } from '../../types';
import { Button } from '../ui/Button';
import { SourceBadge } from '../common/SourceBadge';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Ambulance,
  ArrowRight,
  Info,
} from 'lucide-react';

interface RiskAssessmentCardProps {
  risk: RiskAssessment;
  onRequestDoctor?: () => void;
  isDoctorRequested?: boolean;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  risk,
  onRequestDoctor,
  isDoctorRequested = false,
}) => {
  const isEmergency = risk.level === 'immediate_evaluation';
  const isHigh = risk.level === 'high';
  const isModerate = risk.level === 'moderate';
  const isLow = risk.level === 'low';

  const isEscalationNeeded = isEmergency || isHigh || risk.escalationRequired;

  return (
    <div
      className={`p-6 rounded-2xl border transition-all space-y-5 shadow-xs ${
        isEmergency
          ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20'
          : isHigh
          ? 'bg-orange-50/80 border-orange-200'
          : isModerate
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-emerald-50/70 border-emerald-200'
      }`}
    >
      {/* Top Banner & Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergency
                ? 'bg-rose-600 text-white animate-pulse shadow-xs'
                : isHigh
                ? 'bg-orange-600 text-white'
                : isModerate
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isEmergency ? (
              <ShieldAlert className="w-6 h-6" />
            ) : isHigh ? (
              <AlertOctagonIcon className="w-6 h-6" />
            ) : isModerate ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Risk Assessment</span>
              <SourceBadge source="AI Generated" />
            </div>
            <h3
              className={`text-lg font-black tracking-tight ${
                isEmergency
                  ? 'text-rose-950'
                  : isHigh
                  ? 'text-orange-950'
                  : isModerate
                  ? 'text-amber-950'
                  : 'text-emerald-950'
              }`}
            >
              {risk.label}
            </h3>
          </div>
        </div>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border uppercase self-start sm:self-center ${
            isEmergency
              ? 'bg-rose-200 text-rose-900 border-rose-300'
              : isHigh
              ? 'bg-orange-200 text-orange-900 border-orange-300'
              : isModerate
              ? 'bg-amber-200 text-amber-900 border-amber-300'
              : 'bg-emerald-200 text-emerald-900 border-emerald-300'
          }`}
        >
          {risk.level.replace('_', ' ')}
        </span>
      </div>

      {/* Rationale Section */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Clinical Rationale for Classification
        </h4>
        <p className="text-xs text-slate-800 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-black/5 shadow-2xs font-medium">
          {risk.rationale}
        </p>
      </div>

      {/* Recommended Next Step */}
      <div className="space-y-1.5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommended Next Action</h4>
        <p className="text-xs text-slate-900 font-semibold bg-white p-3 rounded-xl border border-black/5">
          {risk.recommendedNextStep}
        </p>
      </div>

      {/* Prominent Escalation Card for High / Immediate Risk */}
      {isEscalationNeeded && (
        <div className="p-4 rounded-xl bg-white border border-rose-300 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <Stethoscope className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Doctor Escalation Required</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
              Action Required
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">
            <strong>Reason for Escalation:</strong>{' '}
            {risk.escalationReason || 'Elevated risk parameters detected requiring medical officer authorization.'}
          </p>

          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {onRequestDoctor && (
              <Button
                variant="primary"
                size="md"
                disabled={isDoctorRequested}
                onClick={onRequestDoctor}
                leftIcon={<Stethoscope className="w-4 h-4" />}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold shrink-0"
              >
                {isDoctorRequested ? 'Doctor Request Active' : 'Request Remote Doctor Now'}
              </Button>
            )}

            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>District Hub Queue Status:</span>
              <span className="font-bold text-emerald-700">Tele-Consultant Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Safety Notice */}
      {isEmergency && (
        <div className="p-4 rounded-xl bg-rose-950 text-white space-y-2 border border-rose-800 shadow-sm">
          <div className="flex items-center gap-2 text-rose-200 font-bold text-xs uppercase tracking-wider">
            <Ambulance className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <span>CRITICAL SAFETY & EMERGENCY REFERRAL NOTICE</span>
          </div>
          <p className="text-xs text-rose-100 leading-relaxed">
            <strong>Do not wait for AI processing or tele-doctor response if the patient is critical.</strong> If the patient exhibits acute chest pain, severe dyspnea, altered sensorium, or cyanosis, follow your local Sub-Health Centre emergency referral protocol and arrange immediate ambulance transport to District Hospital Ambikapur.
          </p>
        </div>
      )}
    </div>
  );
};

function AlertOctagonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
