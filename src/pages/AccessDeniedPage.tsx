import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6 text-center">
      <Card variant="default" className="p-8 space-y-5 border-rose-200 bg-rose-50/20 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shrink-0 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your current active role (<span className="font-bold text-slate-900">{user?.role}</span>) does not have authorization to view this specialized portal section.
          </p>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-1">
          <p className="font-semibold text-slate-800">Current Profile Details:</p>
          <p className="text-slate-600">{user?.name} ({user?.title})</p>
          <p className="text-slate-500 text-[11px]">{user?.centerName}</p>
        </div>

        <div className="pt-2 space-y-2">
          <Button
            variant="primary"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => {
              if (user?.role === 'DOCTOR') navigate('/doctor/dashboard');
              else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
              else navigate('/dashboard');
            }}
          >
            Return to Authorized Dashboard
          </Button>

          <Button
            variant="outline"
            className="w-full text-xs text-slate-700"
            leftIcon={<UserCheck className="w-3.5 h-3.5 text-teal-600" />}
            onClick={() => {
              switchRole('HEALTH_WORKER');
              navigate('/dashboard');
            }}
          >
            Switch to Health Worker Role
          </Button>
        </div>
      </Card>
    </div>
  );
};
