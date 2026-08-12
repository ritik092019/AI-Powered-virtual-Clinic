import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorRequest } from '../types';
import { doctorService } from '../services/doctorService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useNotification } from '../context/NotificationContext';
import {
  Stethoscope,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  UserCheck,
  AlertOctagon,
  RefreshCcw,
} from 'lucide-react';

export const DoctorRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await doctorService.getDoctorRequests({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      });
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch doctor requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tele-Doctor Escalation Requests</h1>
          <p className="text-xs text-slate-500">
            Health worker consultation cases queued for District Telemedicine Hub specialist authorization.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
          leftIcon={<RefreshCcw className="w-3.5 h-3.5" />}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card variant="default" className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient or consultation ID..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Request Statuses</option>
              <option value="pending">Pending Doctor Accept</option>
              <option value="accepted">Accepted / Active</option>
              <option value="completed">Completed & Signed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="emergency">Emergency / Critical</option>
              <option value="urgent">Urgent</option>
              <option value="routine">Routine</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Feed */}
      <Card variant="default">
        <CardHeader>
          <CardTitle>Active Doctor Escalation Queue ({requests.length})</CardTitle>
          <CardDescription>
            Showing pending, active, and completed tele-consultation requests across sub-health centres.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading doctor requests queue...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 text-sm border border-slate-200">
              No doctor requests found matching current filter parameters.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const isEmergency = req.priority === 'emergency';
                const isUrgent = req.priority === 'urgent';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                      isEmergency
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-300'
                        : isUrgent
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{req.patientName}</span>
                        <StatusBadge status={req.status === 'accepted' ? 'under_review' : req.status} />
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isEmergency
                              ? 'bg-rose-100 text-rose-800'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {req.priority}
                        </span>
                        <span className="text-xs text-slate-500 font-mono font-semibold">#{req.consultationId}</span>
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong>Specialty Needed:</strong> {req.specialtyNeeded}
                      </p>

                      <p className="text-xs text-slate-600 bg-white/80 p-2 rounded border border-black/5">
                        <strong>Reason for Escalation:</strong> {req.notes || 'Tele-doctor authorization requested.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          Requesting Worker: {req.requestingWorkerName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {req.requestedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/consultations/${req.consultationId}`)}
                      >
                        View AI Assessment
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/consultations/${req.consultationId}/tele-consult`)}
                        className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                      >
                        Open Tele-Chat
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
