import React from 'react';
import { DoctorSpecialist } from '../../types/doctorSpecialist';
import { X, Stethoscope, Mail, Phone, Award, MapPin, Globe, Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DetailModalProps {
  doctor: DoctorSpecialist | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (doctor: DoctorSpecialist) => void;
}

export const DoctorSpecialistDetailModal: React.FC<DetailModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !doctor) return null;

  const isAvailable = doctor.availability_status === 'AVAILABLE';
  const isBusy = doctor.availability_status === 'BUSY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between shrink-0 relative">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-900 text-indigo-200 text-[10px] font-bold tracking-wide uppercase border border-indigo-700">
                  {doctor.specialization}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    doctor.is_active
                      ? 'bg-emerald-900/80 text-emerald-200 border-emerald-700'
                      : 'bg-rose-900/80 text-rose-200 border-rose-700'
                  }`}
                >
                  {doctor.is_active ? 'Account Active' : 'Account Deactivated'}
                </span>
              </div>
              <h2 className="text-xl font-bold">{doctor.name}</h2>
              <p className="text-xs text-indigo-200 mt-0.5">{doctor.qualifications}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* Status & Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Availability Status
              </span>
              <span
                className={`font-bold inline-flex items-center gap-1.5 text-xs ${
                  isAvailable ? 'text-emerald-700' : isBusy ? 'text-amber-700' : 'text-slate-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isAvailable ? 'bg-emerald-500 animate-pulse' : isBusy ? 'bg-amber-500' : 'bg-slate-400'
                  }`}
                ></span>
                {doctor.availability_status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Clinical Experience
              </span>
              <span className="font-bold text-slate-900 text-xs">{doctor.experience_years} Years</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Registration / License
              </span>
              <span className="font-mono font-bold text-indigo-900 text-xs">{doctor.license_number}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] border-b border-indigo-100 pb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" /> Contact & Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Official Email</p>
                  <p className="font-semibold text-slate-900 truncate">{doctor.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Contact Phone</p>
                  <p className="font-semibold text-slate-900">{doctor.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Languages */}
          <div className="space-y-3">
            <h4 className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] border-b border-indigo-100 pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Location & Languages
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Practice Location</p>
                <p className="font-semibold text-slate-900">{doctor.address || 'District Health Hub'}</p>
                <p className="text-[11px] text-slate-500">{doctor.city_state || 'Surguja, Chhattisgarh'}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Languages Spoken</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {doctor.languages.map((lang) => (
                    <span key={lang} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-medium text-[11px] border border-indigo-200/60">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          {onEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(doctor);
              }}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
            >
              Edit Specialist Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
