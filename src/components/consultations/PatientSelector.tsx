import React, { useState, useEffect } from 'react';
import { Patient } from '../../types';
import { patientService } from '../../services/patientService';
import { Search, UserCheck, AlertTriangle, ExternalLink, ShieldAlert, Phone, MapPin, Heart, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { useNavigate } from 'react-router-dom';

interface PatientSelectorProps {
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  preSelectedPatientId?: string | null;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatient,
  onSelectPatient,
  preSelectedPatientId,
}) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      setIsLoading(true);
      try {
        const data = await patientService.getPatients();
        setPatients(data);

        // Handle auto pre-selection if passed in props
        if (preSelectedPatientId && !selectedPatient) {
          const match = data.find((p) => p.id === preSelectedPatientId);
          if (match) {
            onSelectPatient(match);
          }
        }
      } catch (err) {
        console.error('Failed to load patients for selector', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPatients();
  }, [preSelectedPatientId]);

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.village.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Register New Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by Name, ID, Village, Phone, or ABHA ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/patients/new')}
          leftIcon={<Plus className="w-4 h-4 text-teal-600" />}
        >
          Register New Patient
        </Button>
      </div>

      {/* Selected Patient Banner */}
      {selectedPatient ? (
        <Card className="border-teal-300 bg-teal-50/40 shadow-xs">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-600 text-white">
                    <UserCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedPatient.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-teal-200 text-teal-800">
                        {selectedPatient.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {selectedPatient.age} yrs, {selectedPatient.gender} • Village: {selectedPatient.village}
                    </p>
                  </div>
                </div>

                {/* Key Summary Badges */}
                <div className="flex flex-wrap gap-2 text-xs pt-1">
                  <div className="flex items-center gap-1 text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                  {selectedPatient.bloodGroup && (
                    <div className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 font-semibold">
                      <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                      <span>Blood Group: {selectedPatient.bloodGroup}</span>
                    </div>
                  )}
                  {selectedPatient.abhaId && (
                    <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                      <span>ABHA: {selectedPatient.abhaId}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                    <span>Lang: {selectedPatient.preferredLanguage}</span>
                  </div>
                </div>

                {/* Active Alerts */}
                {selectedPatient.activeAlerts && selectedPatient.activeAlerts.length > 0 && (
                  <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs text-amber-900 mt-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Active Alerts / Risk Factors: </span>
                      {selectedPatient.activeAlerts.join(' • ')}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button variant="outline" size="sm" onClick={() => setShowProfilePreview(!showProfilePreview)}>
                  {showProfilePreview ? 'Hide Profile' : 'Preview Profile'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfilePreview(false)}
                  className="text-slate-500 hover:text-slate-800 text-xs"
                >
                  Change Patient
                </Button>
              </div>
            </div>

            {/* Profile Drawer / Expandable Preview */}
            {showProfilePreview && (
              <div className="mt-4 pt-4 border-t border-teal-200/60 text-xs space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Full Patient Snapshot</span>
                  <button
                    onClick={() => window.open(`/patients/${selectedPatient.id}`, '_blank')}
                    className="flex items-center gap-1 text-teal-700 font-medium hover:underline text-xs"
                  >
                    Open Full Profile in New Tab <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block">Gram Panchayat:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.gramPanchayat || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sub-Center:</span>
                    <span className="font-medium text-slate-800">{selectedPatient.subCenter || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Emergency Contact:</span>
                    <span className="font-medium text-slate-800">
                      {selectedPatient.emergencyContactName} ({selectedPatient.emergencyContactPhone})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold block">Patient Selection Required</span>
            <span>Please search and select a patient from the registry list below to start the intake.</span>
          </div>
        </div>
      )}

      {/* Patients Selection Grid / List */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Select Patient from Registry ({filteredPatients.length})
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading patient records...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-8 bg-slate-50 rounded-xl text-center text-slate-500 text-sm border border-slate-200">
            No patients match &quot;{searchTerm}&quot;. Click &quot;Register New Patient&quot; above if this is a first-time visitor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient(p)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/80 shadow-xs ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{p.name}</span>
                      <span className="text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {p.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        {p.age} yrs, {p.gender}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {p.village}
                      </span>
                    </div>
                  </div>

                  <Button variant={isSelected ? 'primary' : 'outline'} size="sm">
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
