import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Connectivity Notice',
  description = 'Unable to fetch clinical sync payload. Please check satellite node signal or retry.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-rose-50/50 border border-rose-200 my-4">
      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-rose-700/80 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      )}
    </div>
  );
};
