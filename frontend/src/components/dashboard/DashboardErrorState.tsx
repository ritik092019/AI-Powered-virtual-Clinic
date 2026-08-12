import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const DashboardErrorState: React.FC<DashboardErrorStateProps> = ({
  message = 'Failed to load rural health clinic metrics. Check connection or retry session.',
  onRetry,
}) => {
  return (
    <div className="p-8 text-center bg-rose-50/50 rounded-xl border border-rose-200 space-y-4 my-4">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shrink-0 shadow-2xs">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-sm font-bold text-slate-900">Service Temporarily Unavailable</h3>
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
        <p className="text-[11px] text-slate-400 font-mono mt-1">
          Note: Simulated error state. No fake medical information is rendered.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="bg-rose-700 hover:bg-rose-800 border-rose-700"
        >
          Retry Fetching Clinical Stream
        </Button>
      </div>
    </div>
  );
};
