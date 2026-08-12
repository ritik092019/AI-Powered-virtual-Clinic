import React from 'react';
import { DoctorRequest } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Stethoscope, Clock, UserCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DoctorRequestCardProps {
  request: DoctorRequest;
  onViewCase?: (request: DoctorRequest) => void;
}

export const DoctorRequestCard: React.FC<DoctorRequestCardProps> = ({ request, onViewCase }) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (onViewCase) onViewCase(request);
    else navigate('/doctor-requests');
  };

  const priorityBadges = {
    emergency: <Badge variant="danger">Emergency</Badge>,
    urgent: <Badge variant="warning">Urgent</Badge>,
    routine: <Badge variant="info">Routine</Badge>,
  };

  const statusBadges = {
    pending: <Badge variant="warning" showDot>Pending Doctor</Badge>,
    accepted: <Badge variant="success" showDot>Accepted</Badge>,
    completed: <Badge variant="neutral">Completed</Badge>,
    declined: <Badge variant="danger">Declined</Badge>,
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-slate-500">{request.id}</span>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{request.patientName}</h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {priorityBadges[request.priority]}
          {statusBadges[request.status]}
        </div>
      </div>

      <div className="text-xs text-slate-700 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Specialty Required: <strong className="text-slate-800">{request.specialtyNeeded}</strong></span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {request.requestedAt}</span>
        </div>
        {request.notes && (
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2 leading-relaxed mt-1">
            {request.notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
        <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
          By: {request.requestingWorkerName}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleView}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 border-indigo-200"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Case
        </Button>
      </div>
    </div>
  );
};
