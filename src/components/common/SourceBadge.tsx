import React from 'react';
import { Sparkles, UserCheck, User, Scan, Stethoscope, AlertTriangle } from 'lucide-react';

export type InformationSource =
  | 'AI Generated'
  | 'Health Worker Entered'
  | 'Patient Provided'
  | 'OCR Extracted'
  | 'Doctor Entered';

interface SourceBadgeProps {
  source: InformationSource;
  size?: 'xs' | 'sm';
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, size = 'xs', className = '' }) => {
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  switch (source) {
    case 'AI Generated':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-tight ${sizeClasses} ${className}`}
        >
          <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
          AI Generated
        </span>
      );

    case 'Health Worker Entered':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-teal-50 text-teal-800 border border-teal-200 tracking-tight ${sizeClasses} ${className}`}
        >
          <UserCheck className="w-3 h-3 text-teal-600 shrink-0" />
          Health Worker Entered
        </span>
      );

    case 'Patient Provided':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-tight ${sizeClasses} ${className}`}
        >
          <User className="w-3 h-3 text-slate-500 shrink-0" />
          Patient Provided
        </span>
      );

    case 'OCR Extracted':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 tracking-tight ${sizeClasses} ${className}`}
        >
          <Scan className="w-3 h-3 text-amber-600 shrink-0" />
          OCR Extracted
        </span>
      );

    case 'Doctor Entered':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200 tracking-tight ${sizeClasses} ${className}`}
        >
          <Stethoscope className="w-3 h-3 text-blue-600 shrink-0" />
          Doctor Entered
        </span>
      );

    default:
      return null;
  }
};
