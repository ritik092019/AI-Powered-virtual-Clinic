import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAllAsRead, clearNotification } = useNotification();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Alerts & Notifications</h2>
          <p className="text-xs text-slate-500">
            Audit history of doctor reviews, high priority triage alerts, and offline sync logs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<CheckCheck className="w-4 h-4" />}
          onClick={markAllAsRead}
        >
          Mark All Read
        </Button>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Notification Log ({notifications.length})</CardTitle>
          <CardDescription>
            Showing live frontend alerts dispatched across current session.
          </CardDescription>
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
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-teal-800 text-white rounded-full">
                      New
                    </span>
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
    </div>
  );
};
