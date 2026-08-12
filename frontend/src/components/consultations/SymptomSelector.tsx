import React, { useState } from 'react';
import { Symptom } from '../../types';
import { Plus, X, AlertCircle, Info, Tag, Search, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

const COMMON_RURAL_SYMPTOMS = [
  'Fever (बुखार)',
  'Cough (खाँसी)',
  'Shortness of Breath (साँस फूलना)',
  'Chest Tightness / Pain (छाती में दर्द)',
  'Headache (सिरदर्द)',
  'Abdominal Pain (पेट दर्द)',
  'Skin Rash / Lesion (त्वचा चकत्ते)',
  'Joint / Muscle Pain (जोड़ों का दर्द)',
  'Dizziness / Giddiness (चक्कर आना)',
  'Nausea / Vomiting (उल्टी/जी मिचलाना)',
  'Diarrhea / Loose Stool (दस्त)',
  'Fatigue / Weakness (कमजोरी/थकान)',
  'Sore Throat (गले में खराश)',
  'Ear Pain / Discharge (कान दर्द)',
];

const DURATION_OPTIONS = [
  '1 day',
  '2-3 days',
  '4-7 days',
  '1-2 weeks',
  '3-4 weeks',
  '1-3 months',
  'More than 3 months',
];

interface SymptomSelectorProps {
  chiefComplaint: string;
  onChangeChiefComplaint: (text: string) => void;
  symptoms: Symptom[];
  onChangeSymptoms: (symptoms: Symptom[]) => void;
  priority: 'routine' | 'urgent' | 'emergency';
  onChangePriority: (priority: 'routine' | 'urgent' | 'emergency') => void;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  chiefComplaint,
  onChangeChiefComplaint,
  symptoms,
  onChangeSymptoms,
  priority,
  onChangePriority,
}) => {
  const [customSymptomInput, setCustomSymptomInput] = useState('');

  const handleAddSymptomByName = (symptomName: string) => {
    // Check if already added
    if (symptoms.some((s) => s.name.toLowerCase() === symptomName.toLowerCase())) {
      return;
    }

    const newSymptom: Symptom = {
      id: `sym-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: symptomName,
      severity: 'moderate',
      duration: '2-3 days',
      onset: 'gradual',
      notes: '',
    };

    onChangeSymptoms([...symptoms, newSymptom]);
  };

  const handleRemoveSymptom = (id: string) => {
    onChangeSymptoms(symptoms.filter((s) => s.id !== id));
  };

  const handleUpdateSymptom = (id: string, updates: Partial<Symptom>) => {
    onChangeSymptoms(symptoms.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  return (
    <div className="space-y-6">
      {/* Chief Complaint Input */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-slate-900">
          Primary Chief Complaint <span className="text-rose-500">*</span>
        </label>
        <p className="text-xs text-slate-500">
          Describe the main reason for the patient&apos;s visit in clear, plain language.
        </p>
        <textarea
          rows={3}
          value={chiefComplaint}
          onChange={(e) => onChangeChiefComplaint(e.target.value)}
          placeholder="e.g. High fever for 3 days accompanied by severe dry cough and chest pain..."
          className="w-full p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
        />
      </div>

      {/* Triage Urgency Priority Selector */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Health Worker Initial Priority Triage
          </label>
          <span className="text-xs text-slate-500">Health worker assessment before AI analysis</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onChangePriority('routine')}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
              priority === 'routine'
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Routine (सामान्य)
          </button>
          <button
            type="button"
            onClick={() => onChangePriority('urgent')}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
              priority === 'urgent'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Urgent (गंभीर)
          </button>
          <button
            type="button"
            onClick={() => onChangePriority('emergency')}
            className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
              priority === 'emergency'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Emergency (आपातकालीन)
          </button>
        </div>
      </div>

      {/* Quick Add Common Symptoms Chips */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-teal-600" />
            Select Symptoms
          </label>
          <span className="text-xs text-slate-500">{symptoms.length} symptoms added</span>
        </div>

        <p className="text-xs text-slate-500">Tap common symptoms below to quickly add them to the consultation:</p>

        <div className="flex flex-wrap gap-2">
          {COMMON_RURAL_SYMPTOMS.map((sym) => {
            const isAdded = symptoms.some((s) => s.name.toLowerCase() === sym.toLowerCase());

            return (
              <button
                key={sym}
                type="button"
                onClick={() => !isAdded && handleAddSymptomByName(sym)}
                disabled={isAdded}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all flex items-center gap-1 ${
                  isAdded
                    ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold cursor-default'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-500 hover:bg-teal-50/50'
                }`}
              >
                {isAdded ? '✓ ' : '+ '}
                {sym}
              </button>
            );
          })}
        </div>

        {/* Custom Symptom Input */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Search or enter custom symptom..."
            value={customSymptomInput}
            onChange={(e) => setCustomSymptomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customSymptomInput.trim()) {
                e.preventDefault();
                handleAddSymptomByName(customSymptomInput.trim());
                setCustomSymptomInput('');
              }
            }}
            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={!customSymptomInput.trim()}
            onClick={() => {
              if (customSymptomInput.trim()) {
                handleAddSymptomByName(customSymptomInput.trim());
                setCustomSymptomInput('');
              }
            }}
            leftIcon={<Plus className="w-4 h-4 text-teal-600" />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Added Symptoms Configuration List */}
      {symptoms.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Symptom Details</h4>

          <div className="space-y-3">
            {symptoms.map((symptom, index) => (
              <div
                key={symptom.id}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {symptom.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveSymptom(symptom.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                    title="Remove symptom"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Duration Selector */}
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration
                    </label>
                    <select
                      value={symptom.duration}
                      onChange={(e) => handleUpdateSymptom(symptom.id, { duration: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Onset Selector */}
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Onset Pattern</label>
                    <select
                      value={symptom.onset || 'gradual'}
                      onChange={(e) =>
                        handleUpdateSymptom(symptom.id, {
                          onset: e.target.value as 'sudden' | 'gradual' | 'intermittent',
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="sudden">Sudden (अचानक / Sudden)</option>
                      <option value="gradual">Gradual (धीरे-धीरे / Gradual)</option>
                      <option value="intermittent">Intermittent (आना-जाना / Intermittent)</option>
                    </select>
                  </div>

                  {/* Severity Selector */}
                  <div className="space-y-1">
                    <label className="text-slate-600 font-semibold block">Severity Level</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateSymptom(symptom.id, { severity: 'mild' })}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                          symptom.severity === 'mild'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        Mild
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSymptom(symptom.id, { severity: 'moderate' })}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                          symptom.severity === 'moderate'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        Moderate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSymptom(symptom.id, { severity: 'severe' })}
                        className={`flex-1 py-1.5 rounded text-[11px] font-bold border transition-colors ${
                          symptom.severity === 'severe'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        Severe
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specific Notes Input */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Optional notes e.g. 'Gets worse at night', 'Aggravated after meals'..."
                    value={symptom.notes || ''}
                    onChange={(e) => handleUpdateSymptom(symptom.id, { notes: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
