import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Shield, Eye, Stethoscope, ChevronRight, User, Phone, MapPin } from 'lucide-react';

interface PatientListCardsProps {
  patients: Patient[];
  onStartConsultation: (patient: Patient) => void;
}

export const PatientListCards: React.FC<PatientListCardsProps> = ({
  patients,
  onStartConsultation,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'urgent_referral':
        return <Badge variant="danger">Urgent Referral</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'draft':
        return <Badge variant="neutral">Draft Intake</Badge>;
      default:
        return <Badge variant="default">No Active Session</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'emergency':
        return <Badge variant="danger">Emergency</Badge>;
      case 'urgent':
        return <Badge variant="warning">Urgent</Badge>;
      case 'routine':
      default:
        return <Badge variant="neutral">Routine</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {patients.map((patient) => (
        <Card
          key={patient.id}
          variant="flat"
          className="p-4 hover:border-teal-300 transition-all cursor-pointer bg-white"
          onClick={() => navigate(`/patients/${patient.id}`)}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                {patient.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  {patient.name}
                  {patient.priority === 'emergency' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{patient.id}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {getPriorityBadge(patient.priority)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{patient.gender}, {patient.age} yrs</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{patient.village}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                {patient.preferredLanguage || 'Hindi'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {getStatusBadge(patient.latestConsultationStatus)}
              {patient.abhaId && (
                <span className="text-[10px] text-teal-700 font-medium flex items-center gap-0.5 bg-teal-50 px-1.5 py-0.5 rounded">
                  <Shield className="w-2.5 h-2.5" /> ABHA
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                Profile
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                onClick={() => onStartConsultation(patient)}
              >
                Consult
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
