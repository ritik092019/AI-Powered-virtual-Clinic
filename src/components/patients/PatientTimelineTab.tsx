import React from 'react';
import { Patient, PatientTimelineEvent } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Clock,
  User,
  Stethoscope,
  FileText,
  Camera,
  UserCheck,
  Activity,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface PatientTimelineTabProps {
  patient: Patient;
}

export const PatientTimelineTab: React.FC<PatientTimelineTabProps> = ({ patient }) => {
  const events: PatientTimelineEvent[] = patient.timeline || [
    {
      id: 'tl-default',
      patientId: patient.id,
      type: 'registration',
      title: 'Patient Profile Created',
      description: `Registered at Sub-Health Centre ${patient.village || 'Rampur'}.`,
      timestamp: patient.registeredAt,
      source: 'Frontend Registry',
      author: 'Anita Sharma (ASHA)',
    },
  ];

  const getEventIcon = (type: PatientTimelineEvent['type']) => {
    switch (type) {
      case 'registration':
        return <User className="w-4 h-4 text-teal-600" />;
      case 'consultation':
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'image':
        return <Camera className="w-4 h-4 text-emerald-600" />;
      case 'doctor_request':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'medical_history':
        return <Activity className="w-4 h-4 text-amber-600" />;
      case 'status_change':
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" /> Patient Lifecycle Timeline
        </h3>
        <p className="text-xs text-slate-500">
          Chronological audit trail of all clinical interactions, document scans, and referral events.
        </p>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {events.map((ev) => (
          <div key={ev.id} className="relative group">
            {/* Timeline Node Point */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center shrink-0 z-10 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            </div>

            <Card variant="flat" className="p-4 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-slate-100">{getEventIcon(ev.type)}</div>
                  <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {ev.timestamp}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{ev.description}</p>

              <div className="flex items-center justify-between pt-2 mt-2 text-[11px] text-slate-400 border-t border-slate-100/60">
                <span>Source: {ev.source}</span>
                <span>Author: {ev.author}</span>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
