import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  PhoneOff,
  X,
  Clock,
  ShieldCheck,
  Stethoscope,
  User,
  CheckCircle2,
  Calendar,
  FileText,
  Wifi,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useWebRTCCall, CallState } from '../../hooks/useWebRTCCall';
import { formatDoctorName } from '../../utils/formatters';

interface RealtimeDoctorPatientCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationId: string;
  patientName: string;
  doctorName: string;
  userRole: 'DOCTOR' | 'PATIENT';
}

export const RealtimeDoctorPatientCallModal: React.FC<RealtimeDoctorPatientCallModalProps> = ({
  isOpen,
  onClose,
  consultationId,
  patientName,
  doctorName,
  userRole,
}) => {
  const [showSummaryForm, setShowSummaryForm] = useState<boolean>(false);
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Patient blood pressure and blood sugar are within target ranges. Advised low-salt diet and morning walk.'
  );
  const [followUpDate, setFollowUpDate] = useState<string>('2026-08-20');

  const {
    callState,
    isMuted,
    isCameraOff,
    isSpeakerOff,
    formattedDuration,
    hasMediaPermissions,
    localVideoRef,
    remoteVideoRef,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    endCall,
  } = useWebRTCCall({
    roomId: consultationId,
    consultationId,
    userRole,
    userName: userRole === 'DOCTOR' ? doctorName : patientName,
    onCallEnded: () => {
      setShowSummaryForm(true);
    },
  });

  if (!isOpen) return null;

  const handleFinishConsultation = () => {
    onClose();
  };

  const getStatusBadge = (state: CallState) => {
    switch (state) {
      case 'In Consultation':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            In Consultation (Live)
          </span>
        );
      case 'Calling':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Calling...
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
            Call Completed
          </span>
        );
      case 'Waiting':
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            Waiting for Peer...
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-800 text-white overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Navigation Header */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  {userRole === 'DOCTOR' ? `Patient: ${patientName}` : `Doctor: ${formatDoctorName(doctorName)}`}
                </h3>
                {getStatusBadge(callState)}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span>Room #{consultationId}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> WebRTC Encrypted
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Call Duration Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{formattedDuration}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Grid */}
        <div className="relative flex-1 bg-slate-950 min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* Main Remote Video Stream View */}
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`}
            />

            {/* Remote Fallback / Simulated Video Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-purple-600/20 border-2 border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-3xl shadow-xl">
                  {userRole === 'DOCTOR' ? patientName.charAt(0) : doctorName.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-bold">
                  ✓
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-lg text-white">
                  {userRole === 'DOCTOR' ? patientName : formatDoctorName(doctorName)}
                </h4>
                <p className="text-xs text-purple-300 mt-1 font-mono">
                  {userRole === 'DOCTOR' ? 'Patient Tele-Consultation Stream' : 'Senior Tele-Consultant Specialist'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                  WebRTC P2P low-latency audio/video media channel active. Optimized for rural bandwidth links.
                </p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span>Low Bandwidth Adaptive Codec Active (OPUS/H.264)</span>
              </div>
            </div>
          </div>

          {/* Local User Self-Preview (Picture in Picture) */}
          <div className="absolute bottom-4 right-4 w-36 sm:w-44 aspect-video rounded-xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden z-20">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isCameraOff ? 'hidden' : 'block'}`}
            />
            {isCameraOff && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-center p-2 space-y-1">
                <CameraOff className="w-5 h-5 text-slate-500" />
                <span className="text-[9px] font-bold">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[9px] text-slate-300 font-mono">
              You ({userRole})
            </div>
          </div>
        </div>

        {/* Call Controls Toolbar */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Microphone Mute Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-teal-400" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            {/* Camera On/Off Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                isCameraOff
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
              title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isCameraOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5 text-purple-400" />}
              <span className="hidden sm:inline">{isCameraOff ? 'Camera Off' : 'Camera'}</span>
            </button>

            {/* Speaker Toggle */}
            <button
              type="button"
              onClick={toggleSpeaker}
              className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                isSpeakerOff
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
              title={isSpeakerOff ? 'Unmute Speaker' : 'Mute Speaker'}
            >
              {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
              <span className="hidden sm:inline">{isSpeakerOff ? 'Speaker Muted' : 'Speaker'}</span>
            </button>
          </div>

          {/* End Call Action Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => endCall(clinicalNotes, followUpDate)}
            leftIcon={<PhoneOff className="w-5 h-5" />}
            className="bg-rose-600 hover:bg-rose-700 font-extrabold text-white shadow-lg border border-rose-500 px-6 text-xs sm:text-sm"
          >
            End Call
          </Button>
        </div>
      </div>

      {/* Post-Call Summary Dialog */}
      {showSummaryForm && (
        <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 text-slate-900 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Consultation Call Completed</h3>
                <p className="text-xs text-slate-500">Recorded call duration: <strong>{formattedDuration}</strong></p>
              </div>
            </div>

            {userRole === 'DOCTOR' ? (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-purple-600" /> Authoritative Doctor Notes & Advice
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500/20 focus:outline-none text-xs font-medium"
                    placeholder="Enter clinical observations, diagnosis, or medication advice..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-600" /> Follow-Up Recommended Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-teal-950 text-xs space-y-1">
                <p className="font-bold">Doctor Advice Recorded</p>
                <p className="text-slate-600 leading-relaxed">{clinicalNotes}</p>
                <p className="text-purple-800 font-semibold pt-1">Follow-up Recommended: {followUpDate}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinishConsultation}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
              >
                Save & Close Consultation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
