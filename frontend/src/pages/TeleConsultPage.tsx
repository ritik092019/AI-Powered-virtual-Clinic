import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService } from '../services/consultationService';
import { Consultation } from '../types';
import { TeleConsultChat } from '../components/doctor/TeleConsultChat';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Stethoscope, User, RefreshCcw, Video } from 'lucide-react';
import { RealtimeDoctorPatientCallModal } from '../components/common/RealtimeDoctorPatientCallModal';

export const TeleConsultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [roleView, setRoleView] = useState<'HEALTH_WORKER' | 'DOCTOR'>(
    user?.role === 'DOCTOR' ? 'DOCTOR' : 'HEALTH_WORKER'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const c = await consultationService.getConsultationById(id || 'CNS-9021');
        if (c) setConsultation(c);
      } catch (err) {
        console.error('Failed to load consultation for chat', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium space-y-3">
        <RefreshCcw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="text-sm">Connecting tele-consultation workspace...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-4">
        <p>Consultation record not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/consultations')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/consultations/${consultation.id}`)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Assessment
          </Button>

          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tele-Doctor Consultation: {consultation.patientName}
            </h1>
            <p className="text-xs text-slate-500 font-mono">Consultation #{consultation.id}</p>
          </div>
        </div>

        {/* Role Toggle Switch & Call Button */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsVideoCallOpen(true)}
            leftIcon={<Video className="w-4 h-4 animate-pulse" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md border border-emerald-500"
          >
            Start WebRTC Audio/Video Call
          </Button>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setRoleView('HEALTH_WORKER')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                roleView === 'HEALTH_WORKER' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Health Worker View
            </button>

            <button
              onClick={() => setRoleView('DOCTOR')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                roleView === 'DOCTOR' ? 'bg-indigo-900 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Doctor View
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="h-[520px]">
        <TeleConsultChat
          consultationId={consultation.id}
          currentUserRole={roleView}
          currentUserName={
            roleView === 'DOCTOR' ? 'Dr. Rajesh Verma (Senior Consultant)' : 'Anita Sharma (ANM Rampur)'
          }
        />
      </div>

      {/* Real-time WebRTC Audio/Video Call Modal */}
      <RealtimeDoctorPatientCallModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        consultationId={consultation.id}
        patientName={consultation.patientName}
        doctorName={consultation.doctorName || 'Dr. Rajesh Verma'}
        userRole={roleView === 'DOCTOR' ? 'DOCTOR' : 'PATIENT'}
      />
    </div>
  );
};
