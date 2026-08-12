import React from 'react';
import { Patient } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  User,
  Activity,
  Pill,
  AlertTriangle,
  FileText,
  Shield,
  Sparkles,
  Info,
  CheckCircle2,
  Phone,
  Calendar,
  Languages,
} from 'lucide-react';

interface PatientOverviewTabProps {
  patient: Patient;
  onNavigateTab: (tabKey: string) => void;
}

export const PatientOverviewTab: React.FC<PatientOverviewTabProps> = ({
  patient,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Alert Notices */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Active Clinical Care Alerts ({patient.alerts.length})</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-xs text-amber-800">
            {patient.alerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid Layout: Left Column (Demographics & History), Right Column (Meds, Allergies, AI Banner) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2 Spans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demographic & Registration Card */}
          <Card variant="flat" className="p-5 bg-white border border-slate-200">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" /> Patient Demographics
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Primary record details provided during registration.
                </CardDescription>
              </div>
              <Badge variant="neutral">Source: User-Entered</Badge>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-bold text-slate-800">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Age & DOB</span>
                  <span className="font-medium text-slate-800">
                    {patient.age} yrs {patient.dateOfBirth ? `(${patient.dateOfBirth})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender</span>
                  <span className="font-medium text-slate-800">{patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Phone</span>
                  <span className="font-mono text-slate-800">{patient.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Village / District</span>
                  <span className="font-medium text-slate-800">
                    {patient.village}, {patient.district}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Preferred Language</span>
                  <span className="font-bold text-teal-800">{patient.preferredLanguage || 'Hindi'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ABHA Health ID</span>
                  <span className="font-mono text-slate-800">{patient.abhaId || 'Not linked'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <span className="font-medium text-slate-800">{patient.bloodGroup || 'Unspecified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Date</span>
                  <span className="font-medium text-slate-800">{patient.registeredAt}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-medium text-slate-800">{patient.emergencyContact || 'None listed'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Medical History Overview Card */}
          <Card variant="flat" className="p-5 bg-white border border-slate-200">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" /> Recorded Chronic Conditions
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Diagnosed conditions and past surgical history.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-teal-700 hover:text-teal-900"
                onClick={() => onNavigateTab('history')}
              >
                View Full History
              </Button>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                <div className="space-y-2">
                  {patient.medicalHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.condition}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.diagnosedYear ? `Diagnosed ${item.diagnosedYear} • ` : ''}
                          {item.notes || 'No specific notes recorded'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === 'active' ? 'warning' : 'success'}>
                          {item.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {item.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-lg">
                  No chronic medical conditions recorded during intake.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Medications, Allergies & AI Distinction Callout */}
        <div className="space-y-6">
          {/* Active Medications Preview Card */}
          <Card variant="flat" className="p-5 bg-white border border-slate-200">
            <CardHeader className="p-0 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" /> Current Medications
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-teal-700"
                onClick={() => onNavigateTab('medications')}
              >
                Manage
              </Button>
            </CardHeader>

            <CardContent className="p-0 pt-3">
              {patient.medications && patient.medications.length > 0 ? (
                <div className="space-y-2">
                  {patient.medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-2.5 bg-slate-50 rounded-md border border-slate-200 text-xs"
                    >
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {med.dosage} • {med.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-md">
                  No active routine medications logged.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Known Allergies Preview Card */}
          <Card variant="flat" className="p-5 bg-rose-50/40 border border-rose-200">
            <CardHeader className="p-0 pb-3 border-b border-rose-200/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Documented Allergies
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-rose-800"
                onClick={() => onNavigateTab('medications')}
              >
                Edit
              </Button>
            </CardHeader>

            <CardContent className="p-0 pt-3">
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="space-y-2">
                  {patient.allergies.map((alg) => (
                    <div
                      key={alg.id}
                      className="p-2.5 bg-white rounded-md border border-rose-200 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900">{alg.allergen}</span>
                        <Badge
                          variant={
                            alg.severity === 'life-threatening' || alg.severity === 'severe'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {alg.severity}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Reaction: {alg.reaction}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 text-center bg-white/80 rounded-md">
                  No known drug or environmental allergies logged.
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI vs User-Entered Info Distinction Banner */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-xl shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Data Source Distinction Notice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All records shown above are <strong>User-Entered Clinical Data</strong> provided by
              the frontline health worker. Future AI triage suggestions and automated risk flags
              will be explicitly badged with <span className="text-teal-300">AI Triage Flag</span>{' '}
              to prevent misinterpretation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
