import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Shield, Eye, Stethoscope, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface PatientListTableProps {
  patients: Patient[];
  onStartConsultation: (patient: Patient) => void;
}

export const PatientListTable: React.FC<PatientListTableProps> = ({
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
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
          <tr>
            <th className="py-3.5 px-4">Patient Info</th>
            <th className="py-3.5 px-4">Demographics & Village</th>
            <th className="py-3.5 px-4">Language</th>
            <th className="py-3.5 px-4">Latest Consultation</th>
            <th className="py-3.5 px-4">Triage Priority</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((patient) => (
            <tr
              key={patient.id}
              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <td className="py-3.5 px-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    {patient.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {patient.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <span>{patient.id}</span>
                      {patient.abhaId && (
                        <span className="text-[10px] text-teal-700 font-medium flex items-center gap-0.5 bg-teal-50 px-1 rounded">
                          <Shield className="w-2.5 h-2.5" /> ABHA Linked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              <td className="py-3.5 px-4">
                <div className="text-xs text-slate-800 font-medium">
                  {patient.gender}, {patient.age} yrs
                </div>
                <div className="text-xs text-slate-500">
                  {patient.village}, {patient.district}
                </div>
              </td>

              <td className="py-3.5 px-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                  {patient.preferredLanguage || 'Hindi'}
                </span>
              </td>

              <td className="py-3.5 px-4">
                <div className="flex flex-col gap-1">
                  {getStatusBadge(patient.latestConsultationStatus)}
                  <span className="text-[11px] text-slate-400">
                    {patient.latestConsultationDate || 'No record'}
                  </span>
                </div>
              </td>

              <td className="py-3.5 px-4">{getPriorityBadge(patient.priority)}</td>

              <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
