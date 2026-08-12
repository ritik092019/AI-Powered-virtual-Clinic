import React from 'react';
import { EmergencyAssessmentPayload } from '../../types/emergency';
import { ShieldAlert, AlertOctagon, Activity, Heart, Thermometer, User } from 'lucide-react';

interface QuickInputProps {
  formData: EmergencyAssessmentPayload;
  onChange: (data: EmergencyAssessmentPayload) => void;
}

const QUICK_SYMPTOM_TAGS = [
  'Chest Pain',
  'Severe Bleeding',
  'Breathlessness / Asthma',
  'Burn / Scald',
  'Head Trauma / Injury',
  'Unconscious / Syncope',
  'High Fever (103°F+)',
  'Fracture / Bone Dislocation',
  'Severe Allergic Reaction / Anaphylaxis',
  'Snakebite / Animal Attack',
  'Poisoning / Chemical Exposure',
  'Abdominal Trauma / Severe Pain',
  'Convulsions / Epilepsy Seizure',
  'Heat Stroke / Severe Dehydration',
  'Persistent Vomiting / Diarrhea',
  'Drowning / Near-Drowning',
  'Electric Shock / Electrocution',
  'Obstetric / Pregnancy Hemorrhage',
  'Sudden Facial Weakness / Paralysis',
  'Severe Eye Trauma / Chemical Splash',
];

export const EmergencyQuickInput: React.FC<QuickInputProps> = ({ formData, onChange }) => {
  const toggleSymptom = (tag: string) => {
    const exists = formData.symptoms.includes(tag);
    const updated = exists
      ? formData.symptoms.filter((s) => s !== tag)
      : [...formData.symptoms, tag];
    onChange({ ...formData, symptoms: updated });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* High Alert Toggle Switch (Highlighted) */}
      <div className="p-3.5 rounded-xl bg-linear-to-r from-rose-950 via-rose-900 to-rose-950 text-white border-2 border-rose-500 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-600/50 text-rose-200 animate-pulse border border-rose-400/40 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-sm text-white flex items-center gap-1.5">
              <span>HIGH ALERT DOCTOR BROADCAST</span>
            </h4>
            <p className="text-[11px] text-rose-200">
              Instantly notifies all online tele-doctors via WebSocket push notification.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={formData.high_alert_toggled}
            onChange={(e) => onChange({ ...formData, high_alert_toggled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
        </label>
      </div>

      {/* Rapid Symptoms Tags */}
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Select Primary Emergency Symptoms
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SYMPTOM_TAGS.map((tag) => {
            const isSelected = formData.symptoms.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleSymptom(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs scale-105 border border-rose-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age & Vitals Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Age (Years)</label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="number"
              placeholder="e.g. 45"
              value={formData.age || ''}
              onChange={(e) => onChange({ ...formData, age: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">SpO2 %</label>
          <div className="relative">
            <Activity className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="number"
              placeholder="e.g. 89"
              value={formData.vitals.spo2 || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  vitals: { ...formData.vitals, spo2: e.target.value ? Number(e.target.value) : undefined },
                })
              }
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Systolic BP</label>
          <div className="relative">
            <Heart className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="number"
              placeholder="e.g. 150"
              value={formData.vitals.bp_systolic || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  vitals: { ...formData.vitals, bp_systolic: e.target.value ? Number(e.target.value) : undefined },
                })
              }
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Temp (°F)</label>
          <div className="relative">
            <Thermometer className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 102.4"
              value={formData.vitals.temp_fahrenheit || ''}
              onChange={(e) =>
                onChange({
                  ...formData,
                  vitals: { ...formData.vitals, temp_fahrenheit: e.target.value ? Number(e.target.value) : undefined },
                })
              }
              className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Brief Description */}
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Injury / Emergency Brief Description
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Deep laceration on lower leg from farm machinery, active bleeding..."
          value={formData.injury_description || ''}
          onChange={(e) => onChange({ ...formData, injury_description: e.target.value })}
          className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
        />
      </div>
    </div>
  );
};
