import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { MOCK_ACTIVITY_TIMELINE } from '../mock';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertOctagon,
  Check,
  Clock,
  Info,
  Sparkles,
} from 'lucide-react';

export interface SimplePatientNotification {
  id: string;
  title: string;
  message: string;
  priority: 'IMMEDIATE' | 'HIGH' | 'MODERATE' | 'LOW';
  timestamp: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const { notifications, markAllAsRead, clearNotification } = useNotification();
  const { role, user } = useAuth();

  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  // Simple Patient Notifications list
  const [patientNotifications, setPatientNotifications] = useState<SimplePatientNotification[]>([
    {
      id: 'notif-101',
      title: '🔴 High Priority Clinical Alert Dispatched',
      message: 'Recorded SpO2 level at 89% and BP 148/92 mmHg. Tele-doctor review requested.',
      priority: 'IMMEDIATE',
      timestamp: 'Today, 10:15 AM',
      read: false,
    },
    {
      id: 'notif-102',
      title: 'Gemini AI Prescription Explainer Ready',
      message: 'Parsed Lab_Report_HbA1c_Glucose.pdf. View your step-by-step medication dosage schedule and precautions.',
      priority: 'MODERATE',
      timestamp: 'Today, 09:30 AM',
      read: false,
    },
    {
      id: 'notif-103',
      title: 'Doctor Specialist Allocated',
      message: 'Dr. Rajesh Verma (Senior Tele-Consultant) has accepted your consultation file.',
      priority: 'HIGH',
      timestamp: 'Yesterday, 04:45 PM',
      read: true,
    },
    {
      id: 'notif-104',
      title: 'Daily Medication Dosage Reminder',
      message: 'Take Metformin 500mg (1 tablet) after completing your morning breakfast.',
      priority: 'LOW',
      timestamp: 'Yesterday, 08:00 AM',
      read: true,
    },
    {
      id: 'notif-105',
      title: 'Medical Record OCR Scan Complete',
      message: 'Discharge_Summary_Rampur_PHC.jpg uploaded and attached to your ABHA health record.',
      priority: 'LOW',
      timestamp: '10 Aug 2026',
      read: true,
    },
  ]);

  const toggleReadStatus = (id: string) => {
    setPatientNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    );
  };

  const handleMarkAllRead = () => {
    setPatientNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    markAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    setPatientNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredPatientNotifications = patientNotifications.filter((item) => {
    if (unreadOnly) return !item.read;
    return true;
  });

  const unreadCount = patientNotifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              {role === 'PATIENT' ? 'Patient Notifications' : 'System Alerts'}
            </span>
            {role === 'PATIENT' && (
              <span className="text-xs text-slate-500 font-semibold">• {user?.name || 'Ramesh Patel'}</span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Alerts & Messages</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View your personal medical alerts, document scan updates, and appointment reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4 text-teal-600" />}
            onClick={handleMarkAllRead}
            className="text-xs font-bold"
          >
            Mark All Read ({unreadCount})
          </Button>
        </div>
      </div>

      {role === 'PATIENT' ? (
        /* ================= SIMPLIFIED PATIENT ALERTS & MESSAGES ================= */
        <Card variant="default">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Personal Alerts & Messages</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {patientNotifications.length} Total
                </span>
              </CardTitle>
            </div>

            <label className="flex items-center space-x-2 text-xs font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Unread Only</span>
            </label>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {filteredPatientNotifications.length > 0 ? (
              filteredPatientNotifications.map((notif) => {
                const isHighPriority = notif.priority === 'IMMEDIATE' || notif.priority === 'HIGH';

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all shadow-2xs ${
                      isHighPriority
                        ? 'bg-rose-50/70 border-rose-300'
                        : !notif.read
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isHighPriority
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {isHighPriority ? <AlertOctagon className="w-5 h-5" /> : <Bell className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm">{notif.title}</h4>
                          {!notif.read && (
                            <span className="px-2 py-0.2 text-[9px] font-black bg-teal-800 text-white rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 font-mono block flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {notif.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-center">
                      <button
                        type="button"
                        onClick={() => toggleReadStatus(notif.id)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                          notif.read
                            ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            : 'bg-teal-700 text-white border-teal-800 hover:bg-teal-800'
                        }`}
                      >
                        {notif.read ? 'Read' : 'Mark Read'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 bg-white rounded-xl border border-slate-200 text-center space-y-2 text-slate-500 text-xs">
                <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-700">No Alerts & Messages Found</p>
                <p>You have no notifications matching your current filter.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ================= STANDARD CLINICAL NOTIFICATION LOG ================= */
        <Card variant="default">
          <CardHeader>
            <CardTitle>Notification Log ({notifications.length})</CardTitle>
            <CardDescription>Showing live frontend alerts dispatched across current session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                  n.read ? 'bg-white border-slate-200' : 'bg-teal-50/50 border-teal-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                    {!n.read && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-teal-800 text-white rounded-full">New</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block">{n.timestamp}</span>
                </div>

                <button
                  type="button"
                  onClick={() => clearNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Application Activity Section */}
      <Card variant="default">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>Recent Application Activity</span>
            </CardTitle>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <CardDescription className="text-xs">
            Real-time operational log of registrations, consultations, OCR scans, and doctor requests.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <ActivityTimeline events={MOCK_ACTIVITY_TIMELINE} />
        </CardContent>
      </Card>
    </div>
  );
};
