import React from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'urgent';
  icon: React.ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
  actionText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconBgColor = 'bg-teal-50',
  onClick,
  actionText,
}) => {
  const changeColors = {
    positive: 'text-emerald-700 font-medium',
    negative: 'text-rose-700 font-medium',
    neutral: 'text-slate-500 font-medium',
    urgent: 'text-rose-700 font-bold uppercase tracking-wider',
  };

  return (
    <Card
      variant="default"
      className={cn(
        'p-5 relative overflow-hidden transition-all duration-200 h-full flex flex-col justify-between min-h-[120px]',
        onClick && 'cursor-pointer hover:border-teal-300 hover:shadow-xs group'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          </div>
          {change && (
            <p className={cn('text-xs mt-1.5 flex items-center gap-1', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>

        <div className={cn('p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105', iconBgColor)}>
          {icon}
        </div>
      </div>

      {actionText && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700 group-hover:text-teal-900">
          <span>{actionText}</span>
          <span>→</span>
        </div>
      )}
    </Card>
  );
};
