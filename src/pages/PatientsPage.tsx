import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types';
import { patientService } from '../services/patientService';
import { PatientListTable } from '../components/patients/PatientListTable';
import { PatientListCards } from '../components/patients/PatientListCards';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useNotification } from '../context/NotificationContext';
import {
  Users,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  RefreshCw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

type FilterTab = 'all' | 'recently_added' | 'active_consultation' | 'pending_review' | 'completed';
type SortOption = 'name_asc' | 'newest_consultation' | 'recently_registered';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recently_registered');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const fetchPatients = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch (err) {
      setIsError(true);
      addToast({
        title: 'Error Loading Patients',
        message: 'Could not fetch offline patient registry.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter & Search Logic
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search term matching (Name, ID, Village, Phone, ABHA ID)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        patient.name.toLowerCase().includes(q) ||
        patient.id.toLowerCase().includes(q) ||
        patient.village.toLowerCase().includes(q) ||
        patient.phone.includes(q) ||
        (patient.abhaId && patient.abhaId.includes(q));

      if (!matchesSearch) return false;

      // Filter category matching
      if (activeFilter === 'recently_added') {
        const regDate = new Date(patient.registeredAt);
        const today = new Date('2026-08-12'); // Fixed baseline context date
        const diffDays = Math.abs((today.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 5;
      }
      if (activeFilter === 'active_consultation') {
        return patient.latestConsultationStatus === 'submitted' || patient.latestConsultationStatus === 'under_review' || patient.latestConsultationStatus === 'draft';
      }
      if (activeFilter === 'pending_review') {
        return patient.latestConsultationStatus === 'under_review' || patient.latestConsultationStatus === 'submitted';
      }
      if (activeFilter === 'completed') {
        return patient.latestConsultationStatus === 'completed';
      }

      return true;
    });
  }, [patients, searchQuery, activeFilter]);

  // Sort Logic
  const sortedPatients = useMemo(() => {
    const list = [...filteredPatients];
    if (sortBy === 'name_asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'newest_consultation') {
      return list.sort((a, b) => {
        const dateA = a.latestConsultationDate || '1970-01-01';
        const dateB = b.latestConsultationDate || '1970-01-01';
        return dateB.localeCompare(dateA);
      });
    }
    if (sortBy === 'recently_registered') {
      return list.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    }
    return list;
  }, [filteredPatients, sortBy]);

  // Paginated Results
  const totalPages = Math.ceil(sortedPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPatients.slice(start, start + pageSize);
  }, [sortedPatients, currentPage, pageSize]);

  const handleStartConsultation = (patient: Patient) => {
    addToast({
      title: `Consultation Intake for ${patient.name}`,
      message: `Navigating to clinical intake wizard for ${patient.id}.`,
      type: 'info',
    });
    navigate('/consultations');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" /> Patient Registry & Management
          </h1>
          <p className="text-xs text-slate-500">
            Offline-synchronized village health records, ABHA health IDs, and clinical status.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/patients/new')}
        >
          Register New Patient
        </Button>
      </div>

      {/* Filter Tabs & Search Control Bar */}
      <Card variant="flat" className="p-4 bg-white shadow-2xs border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              placeholder="Search by Patient Name, ID (PAT-xxxx), Village, Phone, or ABHA ID..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Sort Selector & Refresh */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="recently_registered">Recently Registered</option>
                <option value="newest_consultation">Newest Consultation</option>
                <option value="name_asc">Name (A-Z)</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={fetchPatients}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Data-driven Filter Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          {[
            { key: 'all', label: 'All Patients' },
            { key: 'recently_added', label: 'Recently Registered' },
            { key: 'active_consultation', label: 'Active Consultation' },
            { key: 'pending_review', label: 'Pending Doctor Review' },
            { key: 'completed', label: 'Completed' },
          ].map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveFilter(tab.key as FilterTab);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main List Rendering Container */}
      {isLoading ? (
        <Card variant="default" className="p-8 text-center bg-white space-y-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading Patient Registry...</p>
        </Card>
      ) : isError ? (
        <Card variant="flat" className="p-8 text-center bg-rose-50 border border-rose-200">
          <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900">Failed to Load Registry Data</h3>
          <p className="text-xs text-rose-700 mt-1 mb-4">
            Could not retrieve patient list from offline storage.
          </p>
          <Button variant="outline" size="sm" onClick={fetchPatients}>
            Retry Loading
          </Button>
        </Card>
      ) : paginatedPatients.length === 0 ? (
        <EmptyState
          title="No Patients Found"
          description={
            searchQuery
              ? `No patient records matched "${searchQuery}". Try adjusting your search keywords.`
              : 'No patient records match the selected filter category.'
          }
          icon={<Users className="w-8 h-8 text-slate-400" />}
          actionLabel="Register New Patient"
          onAction={() => navigate('/patients/new')}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop Table Layout */}
          <div className="hidden md:block">
            <PatientListTable
              patients={paginatedPatients}
              onStartConsultation={handleStartConsultation}
            />
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden">
            <PatientListCards
              patients={paginatedPatients}
              onStartConsultation={handleStartConsultation}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-slate-200 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{paginatedPatients.length}</span> of{' '}
              <span className="font-bold text-slate-900">{sortedPatients.length}</span> patients
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="font-medium text-slate-800 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
