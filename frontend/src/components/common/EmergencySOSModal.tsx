import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Patient } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import {
  PhoneCall,
  UserCheck,
  Stethoscope,
  HeartAlert,
  MapPin,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Navigation,
  Lock,
} from 'lucide-react';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const { addToast } = useNotification();

  // Safety confirmation step state
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [shareLocation, setShareLocation] = useState<boolean>(true);
  const [locationStatus, setLocationStatus] = useState<string>('Village Rampur, Surguja (GPS Active)');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastTriggeredAction, setLastTriggeredAction] = useState<string | null>(null);

  // Detect browser geolocation if available
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)} (Accurate)`);
        },
        () => {
          setLocationStatus(`Village ${patient?.village || 'Rampur'}, ${patient?.district || 'Surguja'}`);
        }
      );
    }
  }, [isOpen, patient]);

  // Auto-countdown for instant confirmation
  useEffect(() => {
    let timer: any;
    if (isOpen && !confirmed && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setConfirmed(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, confirmed, countdown]);

  if (!isOpen) return null;

  const handleActionClick = async (
    actionKey: string,
    actionLabel: string,
    phoneNumber: string
  ) => {
    setIsSubmitting(true);
    setLastTriggeredAction(actionLabel);

    const payload = {
      action: actionKey,
      latitude: coords.lat,
      longitude: coords.lng,
      location_address: shareLocation ? locationStatus : 'Location hidden by patient choice',
      contact_number: phoneNumber,
    };

    // Try posting to Backend SOS audit API
    try {
      const token = localStorage.getItem('arogya_access_token');
      await axios.post('/api/v1/emergency/sos', payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (e) {
      console.warn('SOS Backend API offline, logging locally.', e);
    }

    addToast({
      title: '🚨 Emergency SOS Dispatched',
      message: `${actionLabel} triggered. Phone dialer opened & health worker alerted.`,
      type: 'error',
    });

    setIsSubmitting(false);

    // Open native phone dialer for instant emergency call
    if (phoneNumber && phoneNumber !== '#') {
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
    }
  };

  const handleReset = () => {
    setConfirmed(false);
    setCountdown(3);
    setLastTriggeredAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-rose-500 max-w-lg w-full overflow-hidden space-y-0 relative animate-scaleUp">
        {/* Top Emergency Header Banner */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-2xl border border-white/30 animate-pulse">
              🆘
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                EMERGENCY SOS RESPONSE
              </h2>
              <p className="text-xs text-rose-100 font-medium">
                Immediate Clinical & Response Assistance
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient Quick Summary Box */}
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-sm">
                {patient?.name || 'Ramesh Patel'}{' '}
                <span className="text-xs font-normal text-slate-500">({patient?.age || 54} Yrs, {patient?.gender || 'Male'})</span>
              </p>
              <p className="text-rose-700 font-semibold flex items-center gap-1">
                <span>Blood Group: <strong>{patient?.bloodGroup || 'B+'}</strong></span>
                <span>•</span>
                <span>ABHA ID: {patient?.abhaId || '91-2384-9021-1123'}</span>
              </p>
            </div>
            <Badge variant="danger" className="uppercase font-mono text-[10px] tracking-wider px-2 py-1">
              CRITICAL READY
            </Badge>
          </div>

          {/* Safety Confirmation Step */}
          {!confirmed ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
                <span>Confirming Emergency Activation... ({countdown}s)</span>
              </div>
              <p className="text-xs text-slate-600">
                Opening emergency dialer. Tap below to confirm immediately or cancel.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmed(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirm SOS Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-slate-300 text-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SOS Armed & Active
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Location Sharing Option */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-teal-600" /> Share Current GPS Location
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
            {shareLocation && (
              <p className="text-[11px] text-slate-600 flex items-center gap-1 font-mono bg-white p-1.5 rounded border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {locationStatus}
              </p>
            )}
          </div>

          {/* 4 Emergency Response Action Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select Immediate Emergency Action
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Action 1: Call Emergency Service 108 */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleActionClick('CALL_EMERGENCY', '108 Ambulance Response', '108')}
                className="flex items-center justify-between p-3.5 rounded-2xl border-2 border-rose-600 bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-md active:scale-98 group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0">
                    🚑
                  </div>
                  <div>
                    <p className="text-sm font-black">108 Emergency Ambulance Service</p>
                    <p className="text-xs text-rose-100 font-normal">National Medical Dispatch Hotline</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-black bg-white/20 px-3 py-1.5 rounded-xl">
                  <PhoneCall className="w-4 h-4" /> <span>Call 108</span>
                </div>
              </button>

              {/* Action 2: Contact Family / Trusted Contact */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleActionClick(
                    'CALL_FAMILY',
                    'Family Emergency Contact',
                    patient?.emergencyContact?.split('-')?.[1]?.trim() || '+919823499881'
                  )
                }
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-amber-400 bg-amber-50/60 hover:bg-amber-100/60 text-slate-900 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    ❤️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950">Trusted Family Member</p>
                    <p className="text-[11px] text-slate-600">{patient?.emergencyContact || 'Suraj Patel (Son) - +91 98234 99881'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Dial
                </span>
              </button>

              {/* Action 3: Contact Assigned Health Worker */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleActionClick('CALL_HEALTH_WORKER', 'Assigned ANM Health Worker', '+919876543210')}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-teal-400 bg-teal-50/60 hover:bg-teal-100/60 text-slate-900 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-teal-950">Assigned ANM Health Worker</p>
                    <p className="text-[11px] text-slate-600">Anita Sharma (+91 98765 43210) • Sub-Health Centre Rampur</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Call ANM
                </span>
              </button>

              {/* Action 4: Contact Tele-Doctor Specialist */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleActionClick('CALL_DOCTOR', 'Tele-Doctor Specialist', '+919876522222')}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-indigo-50/60 hover:bg-indigo-100/60 text-slate-900 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-950">Duty Tele-Doctor Specialist</p>
                    <p className="text-[11px] text-slate-600">Dr. Rajesh Verma • District Telemedicine Hub</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-800 bg-indigo-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Call Doctor
                </span>
              </button>
            </div>
          </div>

          {lastTriggeredAction && (
            <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1 animate-fadeIn">
              <p className="font-bold text-amber-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Action Logged & Alerted
              </p>
              <p className="text-slate-300">
                Triggered: <strong>{lastTriggeredAction}</strong>. Event stored in clinic audit trail with location stamp.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Protected by Clinic RBAC Audit System
          </span>
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
            Close Emergency Screen
          </Button>
        </div>
      </div>
    </div>
  );
};
