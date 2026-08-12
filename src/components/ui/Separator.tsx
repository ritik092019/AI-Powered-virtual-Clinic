import React from 'react';
import { cn } from '../../utils/cn';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className,
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('w-[1px] h-full bg-slate-200 shrink-0 self-stretch', className)} />;
  }

  return <div className={cn('h-[1px] w-full bg-slate-200 shrink-0 my-2', className)} />;
};
