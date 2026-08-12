import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { Alert } from '../components/ui/Alert';
import { Role } from '../types';
import { MOCK_USERS } from '../mock';
import { APP_NAME, APP_SUBTITLE } from '../constants';
import { Eye, EyeOff, HeartPulse, Sparkles, UserCheck, Stethoscope, ShieldCheck, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const { addToast } = useNotification();

  const [email, setEmail] = useState('anita.sharma@arogya.gov.in');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid official healthcare email address.');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      addToast({
        title: 'Authentication Successful',
        message: 'Welcome back to Arogya Health AI virtual clinic portal.',
        type: 'success',
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials or unauthorized healthcare worker email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: Role) => {
    setIsLoading(true);
    try {
      await demoLogin(role);
      const user = MOCK_USERS[role];
      addToast({
        title: `Logged in as ${user.name}`,
        message: `Entered Virtual Clinic as ${user.title}.`,
        type: 'info',
      });
      if (role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'PATIENT') navigate('/patient-portal');
      else navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto font-black text-2xl shadow-lg">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{APP_NAME}</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          {APP_SUBTITLE}
        </p>
      </div>

      {error && (
        <Alert variant="danger" title="Authentication Error">
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Official Email Address / Govt ID"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="worker.name@arogya.gov.in"
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <div className="flex items-center justify-between text-xs">
          <Checkbox
            label="Remember on this tablet"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <button
            type="button"
            onClick={() =>
              addToast({
                title: 'Password Reset Placeholder',
                message: 'Contact your District Health Administrator to reset credentials.',
                type: 'info',
              })
            }
            className="text-teal-700 hover:underline font-semibold"
          >
            Forgot Password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={<Lock className="w-4 h-4" />}
        >
          Sign In to Portal
        </Button>
      </form>

      {/* Demo Roles Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Frontend Demo Quick Launch
          </span>
          <span className="text-[10px] text-slate-400">No Password Required</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick('HEALTH_WORKER')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/80 hover:bg-teal-50/50 text-left transition-all group focus:outline-none"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-teal-800">
                  Anita Sharma (ASHA Worker)
                </p>
                <p className="text-[10px] text-slate-500">Sub-Health Centre Rampur</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              Launch
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('PATIENT')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/80 hover:bg-emerald-50/50 text-left transition-all group focus:outline-none"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800">
                  Ramesh Patel (Patient Portal)
                </p>
                <p className="text-[10px] text-slate-500">View Self Health Record & ABHA ID</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Launch
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('DOCTOR')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/80 hover:bg-indigo-50/50 text-left transition-all group focus:outline-none"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-indigo-800">
                  Dr. Rajesh Verma (Tele-Doctor)
                </p>
                <p className="text-[10px] text-slate-500">District Hospital Ambikapur</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
              Launch
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoClick('ADMIN')}
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/80 hover:bg-amber-50/50 text-left transition-all group focus:outline-none"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-800">
                  Suresh Kumar (District Admin)
                </p>
                <p className="text-[10px] text-slate-500">CMO Operations Secretariat</p>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Launch
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
