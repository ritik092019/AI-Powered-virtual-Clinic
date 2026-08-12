import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ShieldCheck, Activity, Users, Building, RefreshCw } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 text-xs font-semibold border border-amber-700">
              District Operations Administrator
            </span>
            <span className="text-xs text-slate-300">{user?.region}</span>
          </div>
          <h2 className="text-xl font-bold">Chief Medical Officer Administrative Operations</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitor rural health center uptime, doctor telemetry coverage, and district health trends.
          </p>
        </div>

        <div className="hidden sm:block">
          <ShieldCheck className="w-12 h-12 text-amber-400 opacity-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Sub-Health Centers Active</p>
          <p className="text-2xl font-black text-slate-900 mt-1">42 / 44 Online</p>
        </Card>
        <Card variant="default" className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">ASHA Workers Registered</p>
          <p className="text-2xl font-black text-teal-800 mt-1">318 Active</p>
        </Card>
        <Card variant="default" className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Tele-Doctors On Duty</p>
          <p className="text-2xl font-black text-indigo-800 mt-1">14 On Call</p>
        </Card>
        <Card variant="default" className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">District Emergency Referrals</p>
          <p className="text-2xl font-black text-rose-800 mt-1">8 This Week</p>
        </Card>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle>District Health Unit Operational Status</CardTitle>
          <CardDescription>
            Telemetry uptime across district primary health units in Surguja District.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-5 h-5 text-teal-700" />
              <div>
                <p className="font-bold text-slate-900 text-xs">Sub-Health Centre Rampur</p>
                <p className="text-[11px] text-slate-500">
                  Lead ANM: Anita Sharma • Satellite Link: Strong
                </p>
              </div>
            </div>
            <Badge variant="success" showDot>
              100% Operational
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
