import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  Video,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
  Send,
  UserCheck,
  Award,
  ShieldCheck,
  Pill,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Mic,
  Camera,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  patientDoctorConsultationService,
  PatientDoctorConsultation,
  PatientChatMessage,
} from '../../services/patientDoctorConsultationService';
import { formatDoctorName } from '../../utils/formatters';
import { RealtimeDoctorPatientCallModal } from '../common/RealtimeDoctorPatientCallModal';

export const PatientDoctorConsultationSection: React.FC = () => {
  const [consultations, setConsultations] = useState<PatientDoctorConsultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<PatientDoctorConsultation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Chat State
  const [chatMessages, setChatMessages] = useState<PatientChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);

  // Tele-consultation video modal state
  const [isVideoCallOpen, setIsVideoCallOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadConsultations = async () => {
    setIsLoading(true);
    try {
      const data = await patientDoctorConsultationService.getPatientConsultations();
      setConsultations(data);
      if (data.length > 0) {
        setSelectedConsultation(data[0]);
        setChatMessages(data[0].chat_messages || []);
      }
    } catch (err) {
      console.error('Failed to load patient consultations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  useEffect(() => {
    if (selectedConsultation) {
      setChatMessages(selectedConsultation.chat_messages || []);
    }
  }, [selectedConsultation]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSelectConsultation = (item: PatientDoctorConsultation) => {
    setSelectedConsultation(item);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedConsultation) return;

    setIsSendingMessage(true);
    const text = newMessageText;
    setNewMessageText('');

    try {
      const msg = await patientDoctorConsultationService.sendChatMessage(
        selectedConsultation.consultation_id,
        text
      );
      setChatMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error('Failed to send chat message', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderStatusBadge = (status: PatientDoctorConsultation['status']) => {
    switch (status) {
      case 'In Consultation':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            In Consultation (Live)
          </span>
        );
      case 'Doctor Assigned':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs font-bold">
            Doctor Assigned
          </span>
        );
      case 'Scheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold">
            Scheduled
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold">
            Completed
          </span>
        );
      case 'Follow-up Required':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold">
            Follow-up Required
          </span>
        );
      case 'Waiting':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold">
            Waiting For Doctor
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-2">
        <Stethoscope className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
        <p className="font-bold text-sm">Loading Doctor Consultation Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
              Tele-Doctor Consultation Access
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Consultations & Advice
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View assigned doctor details, join live remote consultations, chat in real time, and view doctor prescriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Doctor Consultations */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center justify-between px-1">
            <span>Your Doctor Consultations ({consultations.length})</span>
          </h3>

          {consultations.map((c) => (
            <div
              key={c.consultation_id}
              onClick={() => handleSelectConsultation(c)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 shadow-2xs ${
                selectedConsultation?.consultation_id === c.consultation_id
                  ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {formatDoctorName(c.doctor?.name)}
                  </h4>
                  <p className="text-xs text-purple-700 font-semibold mt-0.5">
                    {c.doctor?.specialization || 'General Physician'}
                  </p>
                </div>
                {renderStatusBadge(c.status)}
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-700">
                  Complaint: &quot;{c.chief_complaint}&quot;
                </p>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {c.appointment_date_time}
                  </span>
                  {c.follow_up_date && (
                    <span className="text-purple-700 font-semibold">• Follow-up: {c.follow_up_date}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Active Doctor Consultation Workspace */}
        <div className="lg:col-span-7">
          {selectedConsultation ? (
            <div className="space-y-6">
              {/* Assigned Doctor Card */}
              <Card variant="default" className="border-purple-200 overflow-hidden shadow-2xs">
                <CardHeader className="bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-lg border border-purple-400/40 shrink-0">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-white">
                            {formatDoctorName(selectedConsultation.doctor?.name)}
                          </h3>
                          <span className="px-2 py-0.2 rounded bg-purple-900 text-purple-200 text-[10px] font-mono border border-purple-700">
                            Verified
                          </span>
                        </div>
                        <p className="text-xs text-purple-200 font-medium">
                          {selectedConsultation.doctor?.specialization}
                        </p>
                        <p className="text-[11px] text-slate-300">
                          {selectedConsultation.doctor?.qualifications} • Exp: {selectedConsultation.doctor?.experience_years} Yrs
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsVideoCallOpen(true)}
                      leftIcon={<Video className="w-4 h-4 animate-pulse" />}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-md"
                    >
                      Join Tele-Consult
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4 text-xs">
                  {/* Appointment Details Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                      <div className="mt-1">{renderStatusBadge(selectedConsultation.status)}</div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Appointment Slot</span>
                      <span className="font-extrabold text-slate-800 block mt-1">
                        {selectedConsultation.appointment_date_time}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Follow-up Date</span>
                      <span className="font-extrabold text-purple-800 block mt-1">
                        {selectedConsultation.follow_up_date || 'TBD by Doctor'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Notes & Instructions */}
                  {selectedConsultation.doctor_notes && (
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                      <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        Authoritative Doctor Clinical Notes
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {selectedConsultation.doctor_notes}
                      </p>
                    </div>
                  )}

                  {/* Prescribed Medications */}
                  {selectedConsultation.prescriptions.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-emerald-600" /> Prescribed Medications
                      </h4>
                      <div className="space-y-1.5">
                        {selectedConsultation.prescriptions.map((rx, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 font-semibold text-xs flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{rx}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real-time Patient-Doctor Live Chat Feed */}
                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-600" /> Real-time Doctor Chat
                    </h4>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 max-h-56 overflow-y-auto">
                      {chatMessages.map((msg) => {
                        const isPatient = msg.sender_role === 'PATIENT';
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                                isPatient
                                  ? 'bg-purple-700 text-white rounded-br-none'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                              }`}
                            >
                              <span className="block text-[10px] font-bold opacity-75 mb-0.5">
                                {msg.sender_name}
                              </span>
                              <span>{msg.message_text}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder={`Message ${formatDoctorName(selectedConsultation.doctor?.name)}...`}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!newMessageText.trim() || isSendingMessage}
                        leftIcon={<Send className="w-3.5 h-3.5" />}
                        className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
                      >
                        Send
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-white text-center space-y-2 text-slate-500 text-xs">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Select a Consultation to View Details</p>
              <p>Click on any assigned doctor consultation on the left to view notes and chat live.</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time WebRTC Audio/Video Call Modal */}
      {selectedConsultation && (
        <RealtimeDoctorPatientCallModal
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          consultationId={selectedConsultation.consultation_id}
          patientName={selectedConsultation.patient_name}
          doctorName={selectedConsultation.doctor?.name || 'Dr. Rajesh Verma'}
          userRole="PATIENT"
        />
      )}
    </div>
  );
};
