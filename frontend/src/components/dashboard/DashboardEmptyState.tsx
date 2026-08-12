import React from 'react';
import { Button } from '../ui/Button';
import { FilePlus, RefreshCw, Users } from 'lucide-react';

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
  onResetFilter?: () => void;
  onRegisterPatient?: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  title = 'No Consultations Found',
  description = 'There are no consultation records matching the selected filter criteria.',
  onResetFilter,
  onRegisterPatient,
}) => {
  return (
    <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-300 space-y-4 my-4">
      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shrink-0 shadow-2xs">
        <Users className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        {onResetFilter && (
          <Button variant="outline" size="sm" onClick={onResetFilter} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Reset Filters
          </Button>
        )}

        {onRegisterPatient && (
          <Button variant="primary" size="sm" onClick={onRegisterPatient} leftIcon={<FilePlus className="w-3.5 h-3.5" />}>
            Start Consultation
          </Button>
        )}
      </div>
    </div>
  );
};
