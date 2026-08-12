import React, { useState } from 'react';
import { Patient, MedicalHistoryItem } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import { Activity, Plus, CheckCircle2, ShieldAlert, X, Calendar } from 'lucide-react';

interface PatientMedicalHistoryTabProps {
  patient: Patient;
  onRefresh: () => void;
}

export const PatientMedicalHistoryTab: React.FC<PatientMedicalHistoryTabProps> = ({
  patient,
  onRefresh,
}) => {
  const { addToast } = useNotification();
  const [showAddModal, setShowAddModal] = useState(false);
  const [condition, setCondition] = useState('');
  const [diagnosedYear, setDiagnosedYear] = useState('');
  const [status, setStatus] = useState<'active' | 'resolved' | 'managed'>('active');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) {
      addToast({ title: 'Validation Error', message: 'Condition name is required.', type: 'warning' });
      return;
    }

    setIsAdding(true);
    try {
      await patientService.addMedicalHistoryItem(patient.id, {
        condition,
        diagnosedYear: diagnosedYear || undefined,
        status,
        notes: notes || undefined,
      });

      addToast({
        title: 'Medical History Added',
        message: `Logged ${condition} in patient medical history.`,
        type: 'success',
      });

      setCondition('');
      setDiagnosedYear('');
      setStatus('active');
      setNotes('');
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to add medical history.', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const items = patient.medicalHistory || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" /> Medical History & Diagnosed Conditions
          </h3>
          <p className="text-xs text-slate-500">
            Recorded chronic conditions, prior surgical procedures, and clinical notes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAddModal(true)}
        >
          Add Condition
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => (
            <Card key={item.id} variant="flat" className="p-4 bg-white border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{item.condition}</h4>
                    <Badge variant={item.status === 'active' ? 'warning' : item.status === 'managed' ? 'info' : 'success'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 space-x-2">
                    {item.diagnosedYear && <span>Diagnosed Year: {item.diagnosedYear}</span>}
                    <span>• Recorded: {item.recordedAt}</span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="self-start sm:self-center">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                    Source: {item.source}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="flat" className="p-8 text-center bg-slate-50 border-dashed border-slate-200">
          <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Medical History Recorded</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            No chronic conditions or past surgical procedures have been logged for this patient yet.
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Medical Condition
          </Button>
        </Card>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-md bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Medical Condition</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condition Name *</label>
                <Input
                  placeholder="e.g. Essential Hypertension"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diagnosed Year</label>
                  <Input
                    placeholder="e.g. 2021"
                    value={diagnosedYear}
                    onChange={(e) => setDiagnosedYear(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Status</label>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="active">Active</option>
                    <option value="managed">Managed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Care Context</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monitored regularly at local PHC."
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>

                <Button variant="primary" type="submit" isLoading={isAdding}>
                  Save Condition
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
