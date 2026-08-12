import React from 'react';
import { cn } from '../../utils/cn';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export interface HealthcareSafetyNoticeProps {
  variant?: 'default' | 'warning' | 'critical';
  className?: string;
  compact?: boolean;
}

export const HealthcareSafetyNotice: React.FC<HealthcareSafetyNoticeProps> = ({
  variant = 'default',
  className,
  compact = false,
}) => {
  const { t } = useLanguage();
  const { role } = useAuth();

  // Do not show clinical disclaimer notice to Patients
  if (role === 'PATIENT') return null;

  const configs = {
    default: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
      tag: t('banner.safety_notice', 'Healthcare Safety Notice'),
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-950',
      icon: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />,
      tag: 'High Priority Triage Notice',
    },
    critical: {
      container: 'bg-rose-50 border-rose-300 text-rose-950',
      icon: <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5 animate-pulse" />,
      tag: 'Emergency Referral Disclaimer',
    },
  };

  const cfg = configs[variant];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium',
          cfg.container,
          className
        )}
      >
        {cfg.icon}
        <span className="leading-tight">
          <strong>{t('banner.ai_principle', 'Arogya AI Support')}:</strong> {t('banner.disclaimer_text', 'Assistive clinical tool only — does not replace qualified medical assessment.')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 shadow-2xs text-xs sm:text-sm',
        cfg.container,
        className
      )}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider mb-1 opacity-90">
          <span>{cfg.tag}</span>
        </div>
        <p className="leading-relaxed opacity-90">
          {t('banner.disclaimer_text', 'Arogya Health AI is a clinical assistance tool designed for rural healthcare workers. It provides triage suggestions based on recorded vitals.')}{' '}
          <strong>{t('banner.ai_principle', 'All medical decisions must be authorized by a licensed healthcare professional.')}</strong>
        </p>
      </div>
    </div>
  );
};
