import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doctorSpecialistSchema, DoctorSpecialistFormInput, DoctorSpecialistFormOutput } from '../../schemas/doctorSpecialistSchema';
import { DoctorSpecialist } from '../../types/doctorSpecialist';
import { X, Stethoscope, User, Mail, Phone, ShieldCheck, Award, MapPin, Globe, Clock, Key } from 'lucide-react';
import { Button } from '../ui/Button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoctorSpecialistFormOutput) => Promise<void>;
  initialData?: DoctorSpecialist | null;
  isLoading?: boolean;
}

const SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Ophthalmology',
  'Pulmonology',
  'ENT (Otolaryngology)',
  'Psychiatry',
];

export const DoctorSpecialistFormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorSpecialistFormInput>({
    resolver: zodResolver(doctorSpecialistSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: 'General Medicine',
      qualifications: '',
      experience_years: 5,
      license_number: '',
      address: '',
      city_state: '',
      languages: 'English, Hindi',
      availability_status: 'AVAILABLE',
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        password: '',
        phone: initialData.phone || '',
        specialization: initialData.specialization,
        qualifications: initialData.qualifications,
        experience_years: initialData.experience_years,
        license_number: initialData.license_number,
        address: initialData.address || '',
        city_state: initialData.city_state || '',
        languages: Array.isArray(initialData.languages) ? initialData.languages.join(', ') : 'English, Hindi',
        availability_status: initialData.availability_status,
        is_active: initialData.is_active,
      });
    } else {
      reset({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: 'General Medicine',
        qualifications: '',
        experience_years: 5,
        license_number: '',
        address: '',
        city_state: '',
        languages: 'English, Hindi',
        availability_status: 'AVAILABLE',
        is_active: true,
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = async (data: DoctorSpecialistFormInput) => {
    // Process input data into required output structure
    const outputData: DoctorSpecialistFormOutput = {
      ...data,
      is_active: data.is_active ?? true,
      experience_years: Number(data.experience_years),
      languages: typeof data.languages === 'string'
        ? data.languages.split(',').map((s) => s.trim()).filter(Boolean)
        : data.languages,
    };
    await onSubmit(outputData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {isEdit ? 'Edit Doctor Specialist Profile' : 'Add New Doctor Specialist'}
              </h3>
              <p className="text-xs text-slate-300">
                {isEdit
                  ? 'Update qualifications, availability, and clinical details'
                  : 'Register a specialist doctor to the Virtual Tele-Clinic roster'}
              </p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2">
              <User className="w-4 h-4 text-indigo-600" /> Basic Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (with Title) *
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g. Dr. Ananya Rao"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Specialization *
                </label>
                <select
                  {...register('specialization')}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="text-xs text-rose-600 mt-1">{errors.specialization.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email (Login ID) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    {...register('email')}
                    disabled={isEdit}
                    type="email"
                    placeholder="doctor@virtualclinic.org"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      {...register('password')}
                      type="password"
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    {...register('phone')}
                    placeholder="+91-9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Credentials */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2">
              <Award className="w-4 h-4 text-indigo-600" /> Professional Credentials & Experience
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qualifications *
                </label>
                <input
                  {...register('qualifications')}
                  placeholder="e.g. MBBS, MD (Pediatrics)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.qualifications && (
                  <p className="text-xs text-rose-600 mt-1">{errors.qualifications.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration / License No. *
                </label>
                <input
                  {...register('license_number')}
                  placeholder="e.g. MCI-58291"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                {errors.license_number && (
                  <p className="text-xs text-rose-600 mt-1">{errors.license_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Experience (Years) *
                </label>
                <input
                  {...register('experience_years')}
                  type="number"
                  min="0"
                  max="60"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.experience_years && (
                  <p className="text-xs text-rose-600 mt-1">{errors.experience_years.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Practice & Languages */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2">
              <MapPin className="w-4 h-4 text-indigo-600" /> Practice Address & Languages
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic / Hospital Address
                </label>
                <input
                  {...register('address')}
                  placeholder="e.g. District Civil Hospital Tele-Consult Room 3"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City & State
                </label>
                <input
                  {...register('city_state')}
                  placeholder="e.g. Surguja, Chhattisgarh"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Languages Spoken (comma-separated)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  {...register('languages')}
                  placeholder="English, Hindi, Telugu, Tamil"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Availability & Account Status */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100 pb-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Availability & Account Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability Status
                </label>
                <select
                  {...register('availability_status')}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="AVAILABLE">AVAILABLE (Accepting Tele-Consultations)</option>
                  <option value="BUSY">BUSY (In Session)</option>
                  <option value="OFFLINE">OFFLINE (Off Duty)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Access Status
                </label>
                <div className="flex items-center space-x-3 mt-1.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-3 text-xs font-bold text-slate-800">
                      Active Tele-Consultant Account
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
            >
              {isEdit ? 'Save Changes' : 'Register Doctor Specialist'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
