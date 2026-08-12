import React from 'react';
import { cn } from '../../utils/cn';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  sublabel?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, sublabel, id, disabled, ...props }, ref) => {
    const generatedId = id || `radio-${Math.random().toString(36).substr(2, 6)}`;

    return (
      <div className="flex items-start space-x-3 select-none">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={generatedId}
            type="radio"
            disabled={disabled}
            className={cn(
              'h-4 w-4 text-teal-700 border-slate-300 focus:ring-2 focus:ring-teal-600 focus:ring-offset-0 disabled:opacity-50 cursor-pointer',
              className
            )}
            {...props}
          />
        </div>
        {(label || sublabel) && (
          <div className="text-sm">
            {label && (
              <label htmlFor={generatedId} className="font-medium text-slate-800 cursor-pointer">
                {label}
              </label>
            )}
            {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
