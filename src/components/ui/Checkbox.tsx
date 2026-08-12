import React from 'react';
import { cn } from '../../utils/cn';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  sublabel?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, sublabel, error, id, disabled, ...props }, ref) => {
    const generatedId = id || `chk-${Math.random().toString(36).substr(2, 6)}`;

    return (
      <div className="flex items-start space-x-3 select-none">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'h-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-2 focus:ring-teal-600 focus:ring-offset-0 disabled:opacity-50 cursor-pointer',
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
            {error && <p className="text-xs text-rose-600 font-medium mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
