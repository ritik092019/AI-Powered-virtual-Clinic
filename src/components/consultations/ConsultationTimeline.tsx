import React from 'react';
import { SourceBadge, InformationSource } from '../common/SourceBadge';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  MessageSquare,
  FileText,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  author: string;
  source: InformationSource;
  statusBadge?: string;
  type:
    | 'created'
    | 'submitted'
    | 'ai_analyzed'
    | 'risk_assessed'
    | 'doctor_requested'
    | 'doctor_accepted'
    | 'message'
    | 'note_added'
    | 'completed';
}

interface ConsultationTimelineProps {
  events: TimelineEvent[];
}

export const ConsultationTimeline: React.FC<ConsultationTimelineProps> = ({ events }) => {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Consultation Audit Timeline</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Deterministic Event Log</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt) => {
          const getIcon = () => {
            switch (evt.type) {
              case 'ai_analyzed':
              case 'risk_assessed':
                return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
              case 'doctor_requested':
              case 'doctor_accepted':
              case 'note_added':
                return <Stethoscope className="w-3.5 h-3.5 text-rose-600" />;
              case 'message':
                return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
              case 'completed':
                return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
              default:
                return <FileText className="w-3.5 h-3.5 text-teal-600" />;
            }
          };

          return (
            <div key={evt.id} className="relative group">
              {/* Event Icon Bullet */}
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs group-hover:border-teal-500">
                {getIcon()}
              </div>

              {/* Event Card Content */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{evt.title}</span>
                  <SourceBadge source={evt.source} />
                  {evt.statusBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {evt.statusBadge}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 ml-auto">{evt.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                <div className="text-[10px] text-slate-400 font-medium">Logged by: {evt.author}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
