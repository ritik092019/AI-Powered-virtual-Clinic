import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { consultationService } from '../services/consultationService';
import { doctorService } from '../services/doctorService';
import { Consultation, DoctorRequest } from '../types';
import { MOCK_ATTENTION_ITEMS, MOCK_ACTIVITY_TIMELINE } from '../mock';

// Dashboard Components
import { StatCard } from '../components/dashboard/StatCard';
import { QuickActionCard } from '../components/dashboard/QuickActionCard';
import { ConsultationTableRow, ConsultationCard } from '../components/dashboard/ConsultationTableRow';
import { DoctorRequestCard } from '../components/dashboard/DoctorRequestCard';
import { AttentionRequiredCard, AttentionItem } from '../components/dashboard/AttentionRequiredCard';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { DashboardErrorState } from '../components/dashboard/DashboardErrorState';

// UI Primitives
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';

// Icons
import {
  Users,
  Activity,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  FilePlus,
  Upload,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Wifi,
  ShieldAlert,
  Clock,
  Filter,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotification();

  // State Management
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<DoctorRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [simulateError, setSimulateError] = useState<boolean>(false);

  // Filter States
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch Dashboard Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      if (simulateError) {
        throw new Error('Simulated network disruption on rural link.');
      }
      const [consData, docData] = await Promise.all([
        consultationService.getConsultations(),
        doctorService.getDoctorRequests(),
      ]);
      setConsultations(consData);
      setDoctorRequests(docData);
    } catch (err) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      navigate('/patient-dashboard');
      return;
    }
    loadDashboardData();
  }, [simulateError, user, navigate]);

  // Filter Logic for Consultations
  const filteredConsultations = consultations.filter((item) => {
    // Search Filter
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab Filter
    if (activeTab === 'today') return item.updatedAt.includes('mins') || item.updatedAt.includes('hours') || item.updatedAt === 'Just now';
    if (activeTab === 'pending') return item.status === 'submitted' || item.status === 'under_review' || item.status === 'draft';
    if (activeTab === 'completed') return item.status === 'completed';
    return true;
  });

  // Calculate Stat Metrics
  const todayPatientsCount = 14;
  const activeConsultationsCount = consultations.filter(
    (c) => c.status === 'submitted' || c.status === 'under_review' || c.status === 'draft'
  ).length;
  const pendingDoctorRequestsCount = doctorRequests.filter((r) => r.status === 'pending').length;
  const highPriorityCasesCount = consultations.filter(
    (c) => c.priority === 'emergency' || c.priority === 'urgent'
  ).length;
  const completedConsultationsCount = consultations.filter((c) => c.status === 'completed').length + 17;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              {user?.centerName || 'Sub-Health Centre Rampur'}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">• Surguja District</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Namaste, {user?.name?.split(' ')[0] || 'Anita'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Frontline Health Worker Portal • Monitor workloads, triage patients, and request tele-doctor reviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSimulateError(!simulateError);
              addToast({
                title: simulateError ? 'Network Restored' : 'Simulating Network Error',
                message: simulateError ? 'Restored mock data feed.' : 'Testing dashboard error state with retry.',
                type: simulateError ? 'success' : 'warning',
              });
            }}
            className={simulateError ? 'border-rose-300 text-rose-700 bg-rose-50' : 'text-slate-600'}
          >
            {simulateError ? 'Restore Mock Data' : 'Test Error State'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Feed
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/consultations')}
            leftIcon={<FilePlus className="w-4 h-4" />}
          >
            New Consultation
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <HealthcareSafetyNotice variant="default" />

      {/* Section 1: Summary Statistics Cards (5 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Today's Patients"
          value={todayPatientsCount}
          change="+4 registered today"
          changeType="positive"
          icon={<Users className="w-5 h-5 text-teal-700" />}
          iconBgColor="bg-teal-50"
          onClick={() => navigate('/patients')}
          actionText="View Patient Registry"
        />

        <StatCard
          title="Active Consultations"
          value={activeConsultationsCount}
          change="3 in intake / review"
          changeType="neutral"
          icon={<Activity className="w-5 h-5 text-sky-700" />}
          iconBgColor="bg-sky-50"
          onClick={() => navigate('/consultations')}
          actionText="Open Consultations"
        />

        <StatCard
          title="Pending Doctor Requests"
          value={pendingDoctorRequestsCount}
          change="2 high priority"
          changeType="urgent"
          icon={<Stethoscope className="w-5 h-5 text-indigo-700" />}
          iconBgColor="bg-indigo-50"
          onClick={() => navigate('/doctor-requests')}
          actionText="View Tele-Queue"
        />

        <StatCard
          title="High-Priority Cases"
          value={highPriorityCasesCount}
          change="Requires Immediate Action"
          changeType="negative"
          icon={<AlertTriangle className="w-5 h-5 text-rose-700" />}
          iconBgColor="bg-rose-50"
          onClick={() => {
            setActiveTab('pending');
            addToast({
              title: 'Filtered Urgent Cases',
              message: 'Showing high priority triage items in table below.',
              type: 'warning',
            });
          }}
          actionText="Focus Priority"
        />

        <StatCard
          title="Completed Today"
          value={completedConsultationsCount}
          change="Prescriptions signed"
          changeType="positive"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50"
          onClick={() => setActiveTab('completed')}
          actionText="View Completed"
        />
      </div>

      {/* Section 2: Prominent Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
              Frontline Quick Actions
            </h2>
            <p className="text-xs text-slate-500">
              One-tap workflows for ASHA & ANM healthcare workers.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 hidden sm:inline">
            Phase 1.2 Interactive Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
          <QuickActionCard
            title="Register Patient"
            description="Create ABHA ID profile"
            icon={<UserPlus className="w-5 h-5" />}
            path="/patients"
            variant="primary"
          />

          <QuickActionCard
            title="Start Consultation"
            description="Log symptoms & vitals"
            icon={<FilePlus className="w-5 h-5" />}
            path="/consultations"
            variant="secondary"
          />

          <QuickActionCard
            title="Upload Report"
            description="Scan lab or prescription OCR"
            icon={<Upload className="w-5 h-5" />}
            path="/documents"
            variant="secondary"
          />

          <QuickActionCard
            title="View Patients"
            description="Browse medical history"
            icon={<Users className="w-5 h-5" />}
            path="/patients"
            variant="secondary"
          />

          <QuickActionCard
            title="Request Doctor"
            description="Escalate to tele-doctor"
            icon={<Stethoscope className="w-5 h-5" />}
            path="/doctor-requests"
            variant="accent"
          />
        </div>
      </div>

      {/* Loading or Error States */}
      {isLoading && <DashboardSkeleton />}

      {hasError && !isLoading && (
        <DashboardErrorState onRetry={loadDashboardData} />
      )}

      {!isLoading && !hasError && (
        <>
          {/* Section 3: Recent Consultations Feed */}
          <Card variant="default">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-slate-100">
              <div>
                <CardTitle>Recent Patient Consultations</CardTitle>
                <CardDescription>
                  Live clinical intake stream with AI triage risk ratings and doctor review statuses.
                </CardDescription>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="w-full sm:w-48">
                  <Input
                    placeholder="Search patient or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                    className="py-1.5 text-xs"
                  />
                </div>

                <Tabs
                  tabs={[
                    { id: 'all', label: 'All' },
                    { id: 'today', label: 'Today' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'completed', label: 'Completed' },
                  ]}
                  activeTab={activeTab}
                  onChange={(tab) => setActiveTab(tab as any)}
                  size="sm"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredConsultations.length === 0 ? (
                <DashboardEmptyState
                  title={searchQuery ? 'No matching search results' : 'No Consultations in this view'}
                  description={
                    searchQuery
                      ? `No records found matching "${searchQuery}". Try clearing search.`
                      : 'There are no active consultation records under the selected filter tab.'
                  }
                  onResetFilter={() => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }}
                  onRegisterPatient={() => navigate('/consultations')}
                />
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Case ID</th>
                          <th className="py-3 px-4">Patient Profile</th>
                          <th className="py-3 px-4">Chief Complaint</th>
                          <th className="py-3 px-4">Triage & Vitals</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Last Updated</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-xs">
                        {filteredConsultations.map((consultation) => (
                          <ConsultationTableRow
                            key={consultation.id}
                            consultation={consultation}
                            onViewDetails={(c) => {
                              addToast({
                                title: `Case ${c.id}`,
                                message: `Opened records for ${c.patientName}.`,
                                type: 'info',
                              });
                              navigate('/consultations');
                            }}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="md:hidden p-4 space-y-3">
                    {filteredConsultations.map((consultation) => (
                      <ConsultationCard
                        key={consultation.id}
                        consultation={consultation}
                        onViewDetails={() => navigate('/consultations')}
                      />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 4: Secondary Multi-Column Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3): Pending Doctor Requests & Attention Required */}
            <div className="lg:col-span-2 space-y-6">
              {/* Attention Required Workflow Section */}
              <Card variant="default">
                <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle>Attention Required</CardTitle>
                      <CardDescription>
                        Operational workflow alerts requiring health worker intervention.
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                    {MOCK_ATTENTION_ITEMS.length} Action Items
                  </span>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  {MOCK_ATTENTION_ITEMS.map((item) => (
                    <AttentionRequiredCard
                      key={item.id}
                      item={item as AttentionItem}
                      onAction={(att) => {
                        addToast({
                          title: att.title,
                          message: `Navigating to ${att.actionPath} to complete workflow item.`,
                          type: 'info',
                        });
                      }}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Pending Doctor Requests Section */}
              <Card variant="default">
                <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Tele-Doctor Escalation Requests</CardTitle>
                    <CardDescription>
                      Cases referred to remote specialist hub waiting for review or prescription signoff.
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold"
                    onClick={() => navigate('/doctor-requests')}
                  >
                    View All Queue →
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  {doctorRequests.map((req) => (
                    <DoctorRequestCard
                      key={req.id}
                      request={req}
                      onViewCase={(r) => {
                        addToast({
                          title: `Tele-Request ${r.id}`,
                          message: `Opening doctor escalation details for ${r.patientName}.`,
                          type: 'info',
                        });
                        navigate('/doctor-requests');
                      }}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column (1/3): Activity Timeline & System Status */}
            <div className="space-y-6">
              {/* Application Activity Timeline */}
              <Card variant="default">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Application Activity</CardTitle>
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </div>
                  <CardDescription>
                    Real-time operational log of registrations, consultations, OCR scans, and doctor requests.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4">
                  <ActivityTimeline events={MOCK_ACTIVITY_TIMELINE} />
                </CardContent>
              </Card>

              {/* Sub-Health Centre Telemetry Widget */}
              <Card variant="flat" className="p-5 space-y-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Satellite Link Status
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Online (12 ms)
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Local DB Cache:</span>
                    <strong className="text-white font-mono">1.2 MB / 50 MB</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Pending Sync Queue:</span>
                    <strong className="text-emerald-300 font-mono">0 Items (Synced)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Health Sub-Centre:</span>
                    <strong className="text-slate-100">Rampur PHC Unit</strong>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-semibold mt-2"
                  onClick={() =>
                    addToast({
                      title: 'Sync Check Complete',
                      message: 'All local patient records are synchronized with District Server.',
                      type: 'success',
                    })
                  }
                >
                  Verify Offline Cache
                </Button>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
