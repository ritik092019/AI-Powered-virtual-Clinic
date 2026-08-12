import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs border border-teal-600',
      secondary: 'bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200/80',
      outline: 'bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 shadow-2xs',
      ghost: 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 font-medium',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs border border-rose-600',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs border border-emerald-600',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
      lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}

        <span>{children}</span>

        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
