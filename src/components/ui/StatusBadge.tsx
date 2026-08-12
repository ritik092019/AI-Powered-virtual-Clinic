import React from 'react';
import { cn } from '../../utils/cn';
import { CheckCircle2, Clock, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: 'draft' | 'submitted' | 'under_review' | 'completed' | 'urgent_referral' | 'pending' | 'accepted' | 'declined';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    draft: {
      label: 'Draft',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
    },
    submitted: {
      label: 'Submitted',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      icon: <Clock className="w-3.5 h-3.5 text-sky-600" />,
    },
    pending: {
      label: 'Pending Review',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    under_review: {
      label: 'Under Doctor Review',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      icon: <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin" />,
    },
    accepted: {
      label: 'Accepted',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />,
    },
    completed: {
      label: 'Consultation Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    },
    urgent_referral: {
      label: 'Urgent Hospital Referral',
      bg: 'bg-rose-100',
      text: 'text-rose-900 font-bold',
      border: 'border-rose-300',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
    },
    declined: {
      label: 'Declined',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" />,
    },
  };

  const cfg = configs[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border',
        cfg.bg,
        cfg.text,
        cfg.border,
        className
      )}
    >
      {cfg.icon}
      <span>{label || cfg.label}</span>
    </span>
  );
};
