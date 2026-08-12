import React from 'react';
import { PhoneCall, PhoneOff, Video, User, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import { Button } from '../ui/Button';

export interface IncomingCallData {
  callId: string;
  consultationId: string;
  patientId: string;
  patientName: string;
  callType?: 'video' | 'audio';
  timestamp?: string;
}

interface IncomingCallModalProps {
  isOpen: boolean;
  callData: IncomingCallData | null;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  callData,
  onAccept,
  onReject,
}) => {
  if (!isOpen || !callData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl max-w-md w-full overflow-hidden text-white shadow-2xl space-y-0 relative animate-bounceIn">
        {/* Ringing Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black border border-white/30 animate-pulse">
              📞
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                INCOMING TELE-CALL
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                Real-Time Remote Consultation Request
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-mono font-bold animate-pulse">
            RINGING...
          </span>
        </div>

        {/* Patient & Call Info Body */}
        <div className="p-6 space-y-5 text-center">
          <div className="relative inline-block mx-auto">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center font-black text-3xl shadow-xl mx-auto">
              {callData.patientName ? callData.patientName.charAt(0) : 'P'}
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-950">
              ✓
            </span>
          </div>

          <div>
            <h4 className="text-xl font-black text-white tracking-tight">
              {callData.patientName || 'Patient Consultation Request'}
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Room #{callData.consultationId} • Encrypted WebRTC Session
            </p>
          </div>

          <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-around text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Video className="w-4 h-4" />
              <span>{callData.callType === 'audio' ? 'Audio Consult' : 'Video Consult'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>JWT Verified</span>
            </div>
          </div>

          {/* Accept / Reject Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="danger"
              size="md"
              onClick={onReject}
              leftIcon={<PhoneOff className="w-5 h-5" />}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 text-xs sm:text-sm shadow-md"
            >
              Decline Call
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onAccept}
              leftIcon={<PhoneCall className="w-5 h-5 animate-bounce" />}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 text-xs sm:text-sm shadow-lg border border-emerald-400"
            >
              Accept Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
