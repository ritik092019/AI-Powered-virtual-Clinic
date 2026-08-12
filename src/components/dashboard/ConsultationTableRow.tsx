import React from 'react';
import { Consultation } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConsultationTableRowProps {
  consultation: Consultation;
  onViewDetails?: (consultation: Consultation) => void;
}

export const ConsultationTableRow: React.FC<ConsultationTableRowProps> = ({
  consultation,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onViewDetails) {
      onViewDetails(consultation);
    } else {
      navigate('/consultations');
    }
  };

  const priorityBadges = {
    emergency: <Badge variant="danger">Emergency</Badge>,
    urgent: <Badge variant="warning">Urgent</Badge>,
    routine: <Badge variant="info">Routine</Badge>,
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
        {consultation.id}
      </td>
      <td className="py-3.5 px-4">
        <div className="font-semibold text-xs text-slate-900">{consultation.patientName}</div>
        <div className="text-[11px] text-slate-500">
          {consultation.patientGender}, {consultation.patientAge} yrs • ID: {consultation.patientId}
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-700 max-w-xs">
        <p className="line-clamp-2 leading-relaxed">{consultation.chiefComplaint}</p>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={consultation.status} />
          {consultation.vitals && (
            <span className="text-[10px] text-slate-500 font-mono">
              BP {consultation.vitals.bpSystolic}/{consultation.vitals.bpDiastolic} | SpO2 {consultation.vitals.spo2Percentage}%
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        {priorityBadges[consultation.priority]}
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-500 shrink-0 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{consultation.updatedAt}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
          onClick={handleAction}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Case
        </Button>
      </td>
    </tr>
  );
};

export const ConsultationCard: React.FC<ConsultationTableRowProps> = ({
  consultation,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onViewDetails) onViewDetails(consultation);
    else navigate('/consultations');
  };

  const priorityBadges = {
    emergency: <Badge variant="danger">Emergency</Badge>,
    urgent: <Badge variant="warning">Urgent</Badge>,
    routine: <Badge variant="info">Routine</Badge>,
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500">{consultation.id}</span>
          {priorityBadges[consultation.priority]}
        </div>
        <StatusBadge status={consultation.status} />
      </div>

      <div>
        <div className="font-bold text-sm text-slate-900">{consultation.patientName}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          {consultation.patientGender}, {consultation.patientAge} yrs • {consultation.patientId}
        </div>
      </div>

      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
        {consultation.chiefComplaint}
      </p>

      {consultation.vitals && (
        <div className="flex items-center justify-between text-[11px] text-slate-600 bg-teal-50/50 p-2 rounded-lg border border-teal-100/60 font-mono">
          <span>BP: {consultation.vitals.bpSystolic}/{consultation.vitals.bpDiastolic} mmHg</span>
          <span>SpO2: {consultation.vitals.spo2Percentage}%</span>
          <span>Pulse: {consultation.vitals.pulseRate} bpm</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Clock className="w-3 h-3" /> {consultation.updatedAt}
        </span>
        <Button variant="outline" size="sm" onClick={handleAction}>
          View Case Record
        </Button>
      </div>
    </div>
  );
};
