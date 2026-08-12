import React, { useState } from 'react';
import { MedicalHistoryItem, Patient } from '../../types';
import { History, Plus, X, Database, Edit3, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface MedicalHistorySelectorProps {
  patient: Patient | null;
  additionalHistory: MedicalHistoryItem[];
  onChangeAdditionalHistory: (history: MedicalHistoryItem[]) => void;
}

export const MedicalHistorySelector: React.FC<MedicalHistorySelectorProps> = ({
  patient,
  additionalHistory,
  onChangeAdditionalHistory,
}) => {
  const [conditionName, setConditionName] = useState('');
  const [diagnosedYear, setDiagnosedYear] = useState('');
  const [status, setStatus] = useState<'active' | 'resolved' | 'managed'>('active');
  const [notes, setNotes] = useState('');

  const existingHistory = patient?.medicalHistory || [];

  const handleAddHistoryItem = () => {
    if (!conditionName.trim()) return;

    const newItem: MedicalHistoryItem = {
      id: `hist-${Date.now()}`,
      condition: conditionName.trim(),
      diagnosedYear: diagnosedYear.trim() || new Date().getFullYear().toString(),
      status: status,
      notes: notes.trim() || 'Recorded during intake visit',
    };

    onChangeAdditionalHistory([...additionalHistory, newItem]);
    setConditionName('');
    setDiagnosedYear('');
    setNotes('');
  };

  const handleRemoveAdditionalItem = (id: string) => {
    onChangeAdditionalHistory(additionalHistory.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Existing Historical Record from Patient File */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-teal-600" />
            Existing Patient Medical Records
          </label>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
            Source: Historical Record
          </span>
        </div>

        {existingHistory.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 italic">
            No past medical history recorded in patient base file.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {existingHistory.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-sm">{item.condition}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-semibold capitalize text-[10px] ${
                      item.status === 'active'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-2">
                  <span>Diagnosed: {item.diagnosedYear}</span>
                </div>
                {item.notes && <p className="text-slate-600 pt-1 italic">{item.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Medical History for Current Visit */}
      <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-teal-600" />
            Add New Condition / Surgical History for Current Intake
          </label>
          <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
            Source: Current Visit Intake
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-slate-700">Condition / Surgery Name</label>
            <input
              type="text"
              placeholder="e.g. Type 2 Diabetes, Appendectomy..."
              value={conditionName}
              onChange={(e) => setConditionName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Year / Onset</label>
            <input
              type="text"
              placeholder="e.g. 2021"
              value={diagnosedYear}
              onChange={(e) => setDiagnosedYear(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'resolved' | 'managed')}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-teal-500"
            >
              <option value="active">Active (सक्रिय)</option>
              <option value="managed">Managed (नियंत्रित)</option>
              <option value="resolved">Resolved (ठीक हुआ)</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="font-semibold text-slate-700">Clinical Notes</label>
            <input
              type="text"
              placeholder="e.g. Under daily medication"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          disabled={!conditionName.trim()}
          onClick={handleAddHistoryItem}
          leftIcon={<Plus className="w-4 h-4 text-teal-600" />}
        >
          Add to Current Intake History
        </Button>
      </div>

      {/* Newly Added History Items List */}
      {additionalHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Newly Added History Items ({additionalHistory.length})
          </h4>
          <div className="space-y-2">
            {additionalHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{item.condition}</span>
                  <span className="text-slate-500 ml-2">({item.diagnosedYear})</span>
                  <span className="ml-2 font-medium capitalize text-teal-800">• {item.status}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
