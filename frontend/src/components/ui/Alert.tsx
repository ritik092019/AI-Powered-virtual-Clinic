import React from 'react';
import { cn } from '../../utils/cn';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, Flame, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'emergency';
  title?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  onDismiss,
  children,
  ...props
}) => {
  const styles = {
    info: 'bg-sky-50 border-sky-200 text-sky-900 icon-sky',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 icon-emerald',
    warning: 'bg-amber-50 border-amber-200 text-amber-950 icon-amber',
    danger: 'bg-rose-50 border-rose-200 text-rose-950 icon-rose',
    emergency: 'bg-red-900 border-red-950 text-white icon-white shadow-md',
  };

  const icons = {
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    danger: <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />,
    emergency: <Flame className="w-5 h-5 text-red-300 animate-pulse shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start p-4 rounded-xl border text-sm gap-3 transition-all',
        styles[variant],
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{icons[variant]}</div>

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-sm mb-0.5 leading-snug">{title}</h4>}
        <div className="text-xs leading-relaxed opacity-95">{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
