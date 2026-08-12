import React from 'react';
import { UserCheck, Activity, FileText, Sparkles, Stethoscope } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: string;
  user: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'patient_registration':
        return <UserCheck className="w-3.5 h-3.5 text-teal-600" />;
      case 'consultation_created':
        return <Activity className="w-3.5 h-3.5 text-sky-600" />;
      case 'document_upload':
        return <FileText className="w-3.5 h-3.5 text-indigo-600" />;
      case 'ai_triage':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case 'doctor_request':
        return <Stethoscope className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((evt) => (
        <div key={evt.id} className="relative group">
          {/* Timeline Dot Icon */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs group-hover:border-teal-500 transition-colors">
            {getIcon(evt.type)}
          </div>

          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-semibold text-xs text-slate-900">{evt.title}</span>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">{evt.time}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span>By: {evt.user}</span>
              <span>•</span>
              <span className="uppercase tracking-wider font-bold text-slate-500">App Activity</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
