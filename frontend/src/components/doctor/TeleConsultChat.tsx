import React, { useState, useEffect } from 'react';
import { DoctorMessage } from '../../types';
import { doctorService } from '../../services/doctorService';
import { consultationSocketService } from '../../services/consultationSocketService';
import { Button } from '../ui/Button';
import {
  MessageSquare,
  Send,
  Video,
  Mic,
  Check,
  CheckCheck,
  Wifi,
  WifiOff,
  User,
  Stethoscope,
  Info,
} from 'lucide-react';

interface TeleConsultChatProps {
  consultationId: string;
  currentUserRole: 'HEALTH_WORKER' | 'DOCTOR';
  currentUserName: string;
}

export const TeleConsultChat: React.FC<TeleConsultChatProps> = ({
  consultationId,
  currentUserRole,
  currentUserName,
}) => {
  const [messages, setMessages] = useState<DoctorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(consultationSocketService.getConnectionStatus());

  // Load initial messages and subscribe to socket updates
  useEffect(() => {
    async function loadChat() {
      const chat = await doctorService.getDoctorMessages(consultationId);
      setMessages(chat);
    }
    loadChat();

    const handleNewMessage = (msg: DoctorMessage) => {
      if (msg.consultationId === consultationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleSocketStatus = (status: { isConnected: boolean }) => {
      setIsConnected(status.isConnected);
    };

    consultationSocketService.on('doctor_message', handleNewMessage);
    consultationSocketService.on('connection_status', handleSocketStatus);

    return () => {
      consultationSocketService.off('doctor_message', handleNewMessage);
      consultationSocketService.off('connection_status', handleSocketStatus);
    };
  }, [consultationId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const sent = await doctorService.sendDoctorMessage(
        consultationId,
        inputMessage,
        currentUserRole,
        currentUserName
      );

      setMessages((prev) => [...prev, sent]);
      consultationSocketService.triggerDoctorMessage(sent);
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send doctor chat message', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header & Connection Indicator */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-teal-400" />
          <div>
            <h4 className="text-sm font-bold tracking-tight">Tele-Doctor Real-Time Communication</h4>
            <p className="text-[10px] text-slate-400">Health Worker & Doctor Live Chat Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
              <Wifi className="w-3 h-3 animate-pulse" /> Live Socket Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
              <WifiOff className="w-3 h-3" /> Socket Offline
            </span>
          )}
        </div>
      </div>

      {/* Audio/Video Consultation Call Placeholder Banner */}
      <div className="p-3 bg-indigo-950 text-indigo-100 border-b border-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-900 text-indigo-300">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Simulated Audio/Video Tele-Consultation Channel</span>
            <span className="text-[10px] text-indigo-300">
              Real-time WebRTC audio/video calls will be enabled in Phase 2.
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Simulated Video Call: Live AV capabilities are not connected in Phase 1 frontend.')}
          className="px-3 py-1.5 rounded-lg bg-indigo-800 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors self-end sm:self-center shrink-0"
        >
          <Video className="w-3.5 h-3.5" />
          Launch Tele-Call (Simulated)
        </button>
      </div>

      {/* Message List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[220px] max-h-[360px] bg-slate-50/60">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No messages exchanged yet. Use the input below to communicate with the doctor.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === currentUserRole;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-medium">
                  {msg.senderRole === 'DOCTOR' ? (
                    <Stethoscope className="w-3 h-3 text-indigo-600" />
                  ) : (
                    <User className="w-3 h-3 text-teal-600" />
                  )}
                  <span className="font-bold text-slate-700">{msg.senderName}</span>
                  <span>({msg.senderRole === 'DOCTOR' ? 'Doctor' : 'Health Worker'})</span>
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-teal-700 text-white rounded-br-none'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                  {msg.deliveryStatus === 'read' ? (
                    <CheckCheck className="w-3 h-3 text-teal-600" />
                  ) : (
                    <Check className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="capitalize">{msg.deliveryStatus}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Type message as ${currentUserRole === 'DOCTOR' ? 'Dr. Specialist' : 'Health Worker'}...`}
          className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 font-medium"
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputMessage.trim() || isSending}
          leftIcon={<Send className="w-3.5 h-3.5" />}
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold shrink-0"
        >
          Send
        </Button>
      </form>
    </div>
  );
};
