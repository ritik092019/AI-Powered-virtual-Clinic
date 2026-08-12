import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SourceBadge } from '../components/common/SourceBadge';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { useNotification } from '../context/NotificationContext';
import { consultationService } from '../services/consultationService';
import { Consultation } from '../types';
import { Plus, Eye, Search, Clock, UserCheck, Stethoscope, Sparkles, Filter, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'review' | 'completed'>('all');

  useEffect(() => {
    async function fetchList() {
      setIsLoading(true);
      try {
        const data = await consultationService.getConsultations();
        setConsultations(data);
      } catch (e) {
        console.error('Failed to load consultations list', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchList();
  }, []);

  const filtered = consultations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      c.patientName.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.chiefComplaint.toLowerCase().includes(q) ||
      c.healthWorkerName.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (statusFilter === 'urgent') return c.priority === 'emergency' || c.priority === 'urgent';
    if (statusFilter === 'review') return c.status === 'submitted' || c.status === 'under_review';
    if (statusFilter === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              Clinical Triage & Queue
            </span>
            <span className="text-xs text-slate-500">AI Triage • Doctor Escalation Hub</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Intake & Consultation Stream</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review recorded patient intake sessions, view preliminary AI differential assessments, and connect with remote tele-doctors.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/consultations/new')}
          className="bg-teal-700 hover:bg-teal-800 font-bold text-white shrink-0"
        >
          New Clinical Intake
        </Button>
      </div>

      <HealthcareSafetyNotice compact />

      <Card variant="default">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>Active Consultations Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {filtered.length} Cases
                </span>
              </CardTitle>
              <CardDescription>
                Filter and manage patient records with AI risk classification.
              </CardDescription>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="w-full sm:w-56">
                <Input
                  placeholder="Search patient or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                  className="py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('urgent')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'urgent' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('review')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'review' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Doctor Pending
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Signed
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm space-y-2">
              <Sparkles className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
              <p>Loading consultation feed...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 text-sm border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-700">No consultations match the selected criteria.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-xs transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {c.patientName} ({c.patientAge}{c.patientGender ? c.patientGender.charAt(0) : ''})
                      </span>
                      <StatusBadge status={c.status} />
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {c.id}
                      </span>
                      {(c.priority === 'emergency' || c.priority === 'urgent') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> High Priority
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Chief Complaint:</strong> {c.chiefComplaint}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <SourceBadge source="Health Worker Entered" />
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        HW: {c.healthWorkerName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {c.updatedAt}
                      </span>
                      {c.vitals && (
                        <>
                          <span>•</span>
                          <span className="text-teal-800 font-semibold bg-teal-50/80 px-2 py-0.5 rounded border border-teal-100">
                            BP: {c.vitals.bpSystolic}/{c.vitals.bpDiastolic} | SpO2: {c.vitals.spo2Percentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5 text-teal-700" />}
                      onClick={() => navigate(`/consultations/${c.id}`)}
                      className="text-teal-800 border-teal-200 hover:bg-teal-50 font-semibold"
                    >
                      View AI Assessment & Risk Rationale
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/doctor-requests`)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                    >
                      Tele-Doctor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
