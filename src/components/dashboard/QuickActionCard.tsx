import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  badgeText?: string;
  onClick?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  path,
  variant = 'secondary',
  badgeText,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onClick) onClick();
    navigate(path);
  };

  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 border-teal-600 shadow-xs',
    secondary: 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs',
    accent: 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-xs',
    outline: 'bg-slate-50 text-slate-800 hover:bg-teal-50/60 border-slate-200 hover:border-teal-300',
  };

  return (
    <button
      type="button"
      onClick={handleAction}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group focus:outline-none focus:ring-2 focus:ring-teal-500/20 h-full min-h-[90px]',
        variants[variant]
      )}
    >
      <div
        className={cn(
          'p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-110',
          variant === 'primary' || variant === 'accent'
            ? 'bg-white/10 text-white'
            : 'bg-teal-50 text-teal-700'
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3
            className={cn(
              'font-bold text-sm tracking-tight truncate',
              variant === 'primary' || variant === 'accent' ? 'text-white' : 'text-slate-900'
            )}
          >
            {title}
          </h3>
          {badgeText && (
            <span
              className={cn(
                'text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider',
                variant === 'primary' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
        <p
          className={cn(
            'text-xs line-clamp-1 leading-relaxed',
            variant === 'primary' || variant === 'accent' ? 'text-white/80' : 'text-slate-500'
          )}
        >
          {description}
        </p>
      </div>
    </button>
  );
};
