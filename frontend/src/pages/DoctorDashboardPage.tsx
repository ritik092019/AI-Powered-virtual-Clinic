import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import { notificationService } from '../services/notificationService';
import { DoctorRequest, Notification } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useNotification } from '../context/NotificationContext';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertOctagon,
  Eye,
  MessageSquare,
  Bell,
  Filter,
  Check,
  Video,
} from 'lucide-react';
import { IncomingCallModal, IncomingCallData } from '../components/common/IncomingCallModal';
import { RealtimeDoctorPatientCallModal } from '../components/common/RealtimeDoctorPatientCallModal';

export const DoctorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState<boolean>(false);
  const [activeCallSession, setActiveCallSession] = useState<{ consultationId: string; patientName: string } | null>(null);

  // Persistent WebSocket listener for Incoming Calls
  useEffect(() => {
    if (!user) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const token = localStorage.getItem('arogya_access_token') || '';
    const doctorUserId = user.id || 'a9110000-0000-4000-a000-000000000001';
    const wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/${doctorUserId}?token=${token}`;

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log(`[Doctor Signaling WS] Connected persistent listener for Doctor '${user.name}'`);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'INCOMING_CALL' || data.type === 'INCOMING_CALL') {
            console.log('[Doctor Signaling WS] Incoming Call Received:', data);
            setIncomingCall({
              callId: data.call_id || `call_${Date.now()}`,
              consultationId: data.consultation_id || 'CONS-1082',
              patientId: data.patient_id || 'PAT-1082',
              patientName: data.patient_name || 'Ramesh Patel',
              callType: data.call_type || 'video',
              timestamp: data.timestamp || new Date().toISOString(),
            });
            setIsIncomingCallOpen(true);
            addToast({
              title: '📞 Incoming Consultation Call',
              message: `Patient ${data.patient_name || 'Ramesh Patel'} is requesting a live tele-consultation.`,
              type: 'warning',
            });
          }
        } catch (e) {
          console.error('[Doctor Signaling WS] Error parsing message:', e);
        }
      };

      socket.onerror = (err) => {
        console.warn('[Doctor Signaling WS] Persistent socket warning:', err);
      };
    } catch (e) {
      console.warn('[Doctor Signaling WS] Setup warning:', e);
    }

    return () => {
      if (socket) socket.close();
    };
  }, [user, addToast]);

  useEffect(() => {
    async function loadDoctorData() {
      setIsLoading(true);
      try {
        const reqs = await doctorService.getDoctorRequests({
          priority: priorityFilter,
          status: statusFilter,
        });
        setRequests(reqs);

        const notifs = await notificationService.getNotifications();
        setNotifications(notifs.slice(0, 4));
      } catch (err) {
        console.error('Failed to load doctor dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDoctorData();
  }, [priorityFilter, statusFilter]);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const highPriorityCases = requests.filter((r) => r.priority === 'emergency' || r.priority === 'urgent');
  const activeConsultations = requests.filter((r) => r.status === 'accepted');
  const recentlyCompleted = requests.filter((r) => r.status === 'completed');

  const handleAcceptCase = async (reqId: string, consultationId: string) => {
    try {
      await doctorService.acceptDoctorRequest(reqId, user?.name || 'Dr. Rajesh Verma');
      addToast({
        title: 'Case Accepted',
        message: 'You have accepted tele-consultation authorization for this case.',
        type: 'success',
      });
      navigate(`/doctor/case/${consultationId}`);
    } catch (err: any) {
      addToast({
        title: 'Accept Failed',
        message: err.message || 'Unable to accept case.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Doctor Special Banner */}
      <div className="bg-linear-to-r from-indigo-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-200 text-xs font-semibold border border-indigo-700">
              Doctor Specialist Hub
            </span>
            <span className="text-xs text-indigo-300">{user?.centerName || 'District Telemedicine Center'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Welcome, {user?.name || 'Dr. Rajesh Verma'}</h2>
          <p className="text-xs text-indigo-200 mt-0.5 max-w-xl">
            Review escalated Sub-Health Centre cases, verify AI risk rationale, conduct remote tele-chat consultations, and sign digital prescriptions.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIncomingCall({
                callId: `call_sim_${Date.now()}`,
                consultationId: 'CONS-1082',
                patientId: 'PAT-1082',
                patientName: 'Ramesh Patel',
                callType: 'video',
                timestamp: new Date().toISOString(),
              });
              setIsIncomingCallOpen(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shrink-0 text-xs shadow-lg animate-pulse border border-emerald-300"
          >
            📞 Simulate Incoming Patient Call
          </Button>
          <Stethoscope className="w-12 h-12 text-indigo-400 opacity-80 hidden sm:block" />
        </div>
      </div>

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 border-amber-200 bg-amber-50/40">
          <p className="text-xs font-bold text-amber-800 uppercase">Pending Requests</p>
          <p className="text-2xl font-black text-amber-950 mt-1">{pendingRequests.length} Cases</p>
        </Card>

        <Card variant="default" className="p-4 border-rose-200 bg-rose-50/40">
          <p className="text-xs font-bold text-rose-800 uppercase">High Priority / Emergency</p>
          <p className="text-2xl font-black text-rose-950 mt-1">{highPriorityCases.length} Critical</p>
        </Card>

        <Card variant="default" className="p-4 border-indigo-200 bg-indigo-50/40">
          <p className="text-xs font-bold text-indigo-800 uppercase">Active Consultations</p>
          <p className="text-2xl font-black text-indigo-950 mt-1">{activeConsultations.length} Active</p>
        </Card>

        <Card variant="default" className="p-4 border-emerald-200 bg-emerald-50/40">
          <p className="text-xs font-bold text-emerald-800 uppercase">Signed Today</p>
          <p className="text-2xl font-black text-emerald-950 mt-1">{recentlyCompleted.length} Completed</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card variant="default" className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter Doctor Queue:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency Only</option>
              <option value="urgent">Urgent Only</option>
              <option value="routine">Routine Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Accept</option>
              <option value="accepted">Accepted / Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SECTION 1: Pending & High Priority Requests */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Pending & High-Priority Doctor Requests</CardTitle>
          <CardDescription>
            Clinical cases escalated from ASHA health workers requiring medical officer authorization.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="p-6 bg-slate-50 text-center text-slate-500 text-xs rounded-xl border border-slate-200">
              No pending doctor requests awaiting review.
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.patientName}</span>
                    <StatusBadge status="under_review" />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        req.priority === 'emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : req.priority === 'urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {req.priority}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">#{req.consultationId}</span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">
                    <strong>Specialty:</strong> {req.specialtyNeeded}
                  </p>

                  <p className="text-xs text-slate-700 bg-white p-2 rounded border border-black/5">
                    <strong>Escalation Reason:</strong> {req.notes || 'AI risk engine flagged elevated vitals.'}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Requested by: {req.requestingWorkerName} • {req.requestedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptCase(req.id, req.consultationId)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                  >
                    Accept Case & Review
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/doctor/case/${req.consultationId}`)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: Active Consultations */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Active Tele-Consultations ({activeConsultations.length})</CardTitle>
          <CardDescription>Cases currently undergoing live tele-chat or prescription writing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeConsultations.length === 0 ? (
            <div className="p-6 bg-slate-50 text-center text-slate-500 text-xs rounded-xl border border-slate-200">
              No active tele-consultation sessions. Accept a pending request above to begin.
            </div>
          ) : (
            activeConsultations.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.patientName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
                      Active Tele-Consult
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">Specialty: {req.specialtyNeeded}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/consultations/${req.consultationId}/tele-consult`)}
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                  >
                    Open Live Tele-Chat
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/doctor/case/${req.consultationId}`)}
                  >
                    Write Prescription
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* SECTION 3: Recently Completed & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Completed */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Recently Signed Consultations</CardTitle>
            <CardDescription>Digital prescriptions signed and authorized today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentlyCompleted.length === 0 ? (
              <div className="p-6 bg-slate-50 text-center text-slate-500 text-xs rounded-xl border border-slate-200">
                No completed prescriptions signed in this session.
              </div>
            ) : (
              recentlyCompleted.map((req) => (
                <div key={req.id} className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs">{req.patientName}</span>
                    <p className="text-[10px] text-slate-500">Authorized prescription transmitted to SHC Rampur.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Signed & Complete
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Doctor Tele-Queue Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{n.timestamp}</span>
                </div>
                <p className="text-slate-600">{n.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Incoming Call Modal Alert */}
      <IncomingCallModal
        isOpen={isIncomingCallOpen}
        callData={incomingCall}
        onAccept={() => {
          setIsIncomingCallOpen(false);
          if (incomingCall) {
            setActiveCallSession({
              consultationId: incomingCall.consultationId,
              patientName: incomingCall.patientName,
            });
            addToast({
              title: 'Call Connected',
              message: `Joining live WebRTC consultation session with ${incomingCall.patientName}.`,
              type: 'success',
            });
          }
        }}
        onReject={() => {
          setIsIncomingCallOpen(false);
          addToast({
            title: 'Call Declined',
            message: 'Incoming call declined.',
            type: 'info',
          });
          setIncomingCall(null);
        }}
      />

      {/* Active WebRTC Doctor Call Modal */}
      {activeCallSession && (
        <RealtimeDoctorPatientCallModal
          isOpen={!!activeCallSession}
          onClose={() => setActiveCallSession(null)}
          consultationId={activeCallSession.consultationId}
          patientName={activeCallSession.patientName}
          doctorName={user?.name || 'Dr. Rajesh Verma'}
          userRole="DOCTOR"
        />
      )}
    </div>
  );
};
