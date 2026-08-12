import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient, Consultation } from '../../types';
import { MOCK_CONSULTATIONS } from '../../mock';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Stethoscope, Plus, Calendar, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

interface PatientConsultationsTabProps {
  patient: Patient;
  onStartNewConsultation: () => void;
}

export const PatientConsultationsTab: React.FC<PatientConsultationsTabProps> = ({
  patient,
  onStartNewConsultation,
}) => {
  const navigate = useNavigate();

  // Filter consultations matching this patient
  const patientConsultations = MOCK_CONSULTATIONS.filter(
    (c) => c.patientId === patient.id || c.patientName === patient.name
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return <Badge variant="warning">Under Doctor Review</Badge>;
      case 'urgent_referral':
        return <Badge variant="danger font-bold">Urgent Referral</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'draft':
        return <Badge variant="neutral">Draft Intake</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
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
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" /> Consultation History Log
          </h3>
          <p className="text-xs text-slate-500">
            Previous clinical intake sessions, vitals captures, and doctor reviews.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={onStartNewConsultation}
        >
          New Consultation
        </Button>
      </div>

      {patientConsultations.length > 0 ? (
        <div className="space-y-3">
          {patientConsultations.map((c) => (
            <Card
              key={c.id}
              variant="flat"
              className="p-4 bg-white border border-slate-200 hover:border-teal-300 transition-all cursor-pointer"
              onClick={() => navigate('/consultations')}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono">{c.id}</span>
                    {getStatusBadge(c.status)}
                    {getPriorityBadge(c.priority)}
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mt-1">
                    Chief Complaint: "{c.chiefComplaint}"
                  </h4>

                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {c.createdAt}
                    </span>
                    <span>• Worker: {c.healthWorkerName}</span>
                    {c.doctorName && <span className="text-purple-700 font-medium">• Doctor: {c.doctorName}</span>}
                  </div>

                  {c.vitals && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 flex flex-wrap gap-3">
                      <span><strong>BP:</strong> {c.vitals.bpSystolic}/{c.vitals.bpDiastolic} mmHg</span>
                      <span><strong>Pulse:</strong> {c.vitals.pulseRate} bpm</span>
                      <span><strong>Temp:</strong> {c.vitals.tempFahrenheit}°F</span>
                      <span><strong>SpO2:</strong> {c.vitals.spo2Percentage}%</span>
                    </div>
                  )}
                </div>

                <div className="self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/consultations');
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="flat" className="p-8 text-center bg-slate-50 border-dashed border-slate-200">
          <Stethoscope className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Consultation History</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            This patient has no completed or ongoing consultation records.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onStartNewConsultation}
          >
            Start First Consultation
          </Button>
        </Card>
      )}
    </div>
  );
};
