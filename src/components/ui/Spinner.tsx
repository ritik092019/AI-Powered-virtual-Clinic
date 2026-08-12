import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="inline-flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-teal-700', sizes[size], className)} />
      {label && <p className="text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );
};
