import React, { useState } from 'react';
import {
  useDoctorSpecialists,
  useCreateDoctorSpecialist,
  useUpdateDoctorSpecialist,
  useToggleDoctorStatus,
} from '../hooks/useDoctorSpecialists';
import { DoctorSpecialist, DoctorAvailabilityStatus } from '../types/doctorSpecialist';
import { DoctorSpecialistFormOutput } from '../schemas/doctorSpecialistSchema';
import { DoctorSpecialistFormModal } from '../components/admin/DoctorSpecialistFormModal';
import { DoctorSpecialistDetailModal } from '../components/admin/DoctorSpecialistDetailModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNotification } from '../context/NotificationContext';
import {
  Stethoscope,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Award,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Power,
  RefreshCw,
  AlertTriangle,
  Clock,
  Building,
} from 'lucide-react';

const SPECIALTIES = [
  'ALL',
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Ophthalmology',
  'Pulmonology',
];

export const DoctorSpecialistManagementPage: React.FC = () => {
  const { addToast } = useNotification();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<DoctorAvailabilityStatus | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorSpecialist | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorSpecialist | null>(null);

  // TanStack Query Hooks
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useDoctorSpecialists({
    search: searchTerm,
    specialization: specialtyFilter,
    availability: availabilityFilter,
    is_active: statusFilter === 'ACTIVE' ? true : statusFilter === 'INACTIVE' ? false : undefined,
  });

  const createMutation = useCreateDoctorSpecialist();
  const updateMutation = useUpdateDoctorSpecialist();
  const toggleStatusMutation = useToggleDoctorStatus();

  const doctors = data?.doctors || [];
  const totalCount = data?.total || 0;

  const activeCount = doctors.filter((d) => d.is_active).length;
  const availableCount = doctors.filter((d) => d.availability_status === 'AVAILABLE').length;

  const handleFormSubmit = async (formData: DoctorSpecialistFormOutput) => {
    try {
      if (editingDoctor) {
        await updateMutation.mutateAsync({ id: editingDoctor.id, data: formData });
        addToast({
          title: 'Doctor Specialist Updated',
          message: `Dr. ${formData.name}'s profile has been updated successfully.`,
          type: 'success',
        });
      } else {
        await createMutation.mutateAsync(formData);
        addToast({
          title: 'Doctor Specialist Registered',
          message: `Dr. ${formData.name} has been added to the specialist roster.`,
          type: 'success',
        });
      }
      setIsFormModalOpen(false);
      setEditingDoctor(null);
    } catch (err: any) {
      addToast({
        title: 'Operation Failed',
        message: err?.response?.data?.message || err.message || 'Could not save doctor profile.',
        type: 'error',
      });
    }
  };

  const handleToggleActive = async (doctor: DoctorSpecialist) => {
    const newStatus = !doctor.is_active;
    try {
      await toggleStatusMutation.mutateAsync({ id: doctor.id, is_active: newStatus });
      addToast({
        title: newStatus ? 'Doctor Activated' : 'Doctor Deactivated',
        message: `Account for ${doctor.name} is now ${newStatus ? 'Active' : 'Deactivated'}.`,
        type: newStatus ? 'success' : 'warning',
      });
    } catch (err: any) {
      addToast({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || err.message || 'Could not update account status.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-200 text-xs font-semibold border border-indigo-700">
              District Telemedicine Hub
            </span>
            <span className="text-xs text-slate-300">Admin Specialist Management</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Doctor Specialist Management
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            View, search, filter, register, edit, and control account active status for specialist doctors across the district rural healthcare network.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingDoctor(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
          >
            Add Doctor Specialist
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 border-indigo-200 bg-indigo-50/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Roster Specialists</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount} Doctors</p>
            </div>
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card variant="default" className="p-4 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Active Accounts</p>
              <p className="text-2xl font-black text-emerald-800 mt-1">{activeCount} Active</p>
            </div>
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card variant="default" className="p-4 border-teal-200 bg-teal-50/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Available On-Call</p>
              <p className="text-2xl font-black text-teal-800 mt-1">{availableCount} Online</p>
            </div>
            <div className="p-3 bg-teal-600 text-white rounded-xl shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card variant="default" className="p-4 border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Deactivated Accounts</p>
              <p className="text-2xl font-black text-slate-600 mt-1">
                {totalCount - activeCount} Inactive
              </p>
            </div>
            <div className="p-3 bg-slate-700 text-white rounded-xl shadow-xs">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar: Search & Filters */}
      <Card variant="default" className="p-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, specialty, license no, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filters:</span>
            </div>

            {/* Specialty Filter */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Specialties</option>
              {SPECIALTIES.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Availability</option>
              <option value="AVAILABLE">AVAILABLE Only</option>
              <option value="BUSY">BUSY Only</option>
              <option value="OFFLINE">OFFLINE Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Accounts Only</option>
              <option value="INACTIVE">Deactivated Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Doctor List Section */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Doctor Specialists Roster...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 space-y-2">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-bold text-sm">Failed to Load Doctor Roster</p>
          <p className="text-xs text-rose-600 max-w-md mx-auto">
            {error instanceof Error ? error.message : 'An error occurred while communicating with the backend.'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 border-rose-300 text-rose-800">
            Retry Loading
          </Button>
        </div>
      ) : doctors.length === 0 ? (
        <Card variant="default" className="p-12 text-center text-slate-500 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Doctor Specialists Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || specialtyFilter !== 'ALL' || availabilityFilter !== 'ALL'
              ? 'No doctors match your active search or filter criteria. Try clearing filters.'
              : 'No specialist doctors have been added to the platform yet. Click below to add the first doctor.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingDoctor(null);
              setIsFormModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
          >
            Register Doctor Specialist
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const isAvail = doctor.availability_status === 'AVAILABLE';
            const isBusy = doctor.availability_status === 'BUSY';

            return (
              <Card
                key={doctor.id}
                variant="default"
                className={`flex flex-col justify-between transition-all duration-200 hover:shadow-md border ${
                  !doctor.is_active
                    ? 'border-slate-300 bg-slate-50/70 opacity-80'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  {/* Card Top Header */}
                  <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {doctor.name}
                        </h3>
                        <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                          {doctor.specialization}
                        </p>
                        <p className="text-[11px] text-slate-500">{doctor.qualifications}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          doctor.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {doctor.is_active ? 'Active' : 'Inactive'}
                      </span>

                      <span
                        className={`text-[10px] font-bold flex items-center gap-1 ${
                          isAvail ? 'text-emerald-600' : isBusy ? 'text-amber-600' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isAvail ? 'bg-emerald-500 animate-pulse' : isBusy ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                        ></span>
                        {doctor.availability_status}
                      </span>
                    </div>
                  </div>

                  {/* Card Details Body */}
                  <div className="p-5 space-y-3 text-xs text-slate-600">
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-500">License No:</span>
                      <span className="font-mono font-bold text-indigo-950 text-xs">
                        {doctor.license_number}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 font-semibold block">Experience</span>
                        <span className="font-bold text-slate-800">{doctor.experience_years} Years</span>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block">City / State</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {doctor.city_state || 'Surguja, CG'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doctor.phone || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Languages Spoken */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Languages
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {doctor.languages.map((l) => (
                          <span
                            key={l}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded text-[10px]"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDoctor(doctor)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingDoctor(doctor);
                        setIsFormModalOpen(true);
                      }}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                      className="text-xs text-indigo-700 hover:text-indigo-800"
                    >
                      Edit
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(doctor)}
                    disabled={toggleStatusMutation.isPending}
                    leftIcon={<Power className="w-3.5 h-3.5" />}
                    className={`text-xs font-bold ${
                      doctor.is_active
                        ? 'text-rose-700 hover:bg-rose-50 border-rose-200'
                        : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    {doctor.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal (Add / Edit) */}
      <DoctorSpecialistFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingDoctor(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingDoctor}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Detail Modal */}
      <DoctorSpecialistDetailModal
        doctor={selectedDoctor}
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onEdit={(doc) => {
          setSelectedDoctor(null);
          setEditingDoctor(doc);
          setIsFormModalOpen(true);
        }}
      />
    </div>
  );
};
