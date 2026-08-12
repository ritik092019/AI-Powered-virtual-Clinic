import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'teal' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  color = 'teal',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    teal: 'bg-teal-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-600',
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs text-slate-600 font-medium">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
