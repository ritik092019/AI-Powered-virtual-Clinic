import React, { useState } from 'react';
import { VitalSigns } from '../../types';
import { HeartPulse, AlertTriangle, CheckCircle2, Thermometer, Activity, Droplets, Wind, ShieldAlert } from 'lucide-react';

interface VitalInputProps {
  vitals: VitalSigns;
  onChangeVitals: (vitals: VitalSigns) => void;
}

export const VitalInput: React.FC<VitalInputProps> = ({ vitals, onChangeVitals }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof VitalSigns, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const updated = { ...vitals, [field]: numValue };

    // Perform validation
    const newErrors: Record<string, string> = { ...errors };

    if (field === 'tempFahrenheit' && numValue !== undefined) {
      if (numValue < 90.0 || numValue > 108.0) {
        newErrors.tempFahrenheit = 'Temperature must be between 90.0°F and 108.0°F';
      } else {
        delete newErrors.tempFahrenheit;
      }
    }

    if (field === 'spo2Percentage' && numValue !== undefined) {
      if (numValue < 50 || numValue > 100) {
        newErrors.spo2Percentage = 'SpO2 percentage must be between 50% and 100%';
      } else {
        delete newErrors.spo2Percentage;
      }
    }

    if (field === 'pulseRate' && numValue !== undefined) {
      if (numValue < 30 || numValue > 220) {
        newErrors.pulseRate = 'Pulse rate must be between 30 and 220 bpm';
      } else {
        delete newErrors.pulseRate;
      }
    }

    if (
      (field === 'bpSystolic' || field === 'bpDiastolic') &&
      updated.bpSystolic !== undefined &&
      updated.bpDiastolic !== undefined
    ) {
      if (updated.bpSystolic <= updated.bpDiastolic) {
        newErrors.bp = 'Systolic pressure must be greater than Diastolic pressure';
      } else {
        delete newErrors.bp;
      }
    }

    setErrors(newErrors);
    onChangeVitals(updated);
  };

  // Helper flags for visual warnings
  const warnings: string[] = [];
  if (vitals.bpSystolic && vitals.bpSystolic >= 140) warnings.push('Elevated Systolic Blood Pressure (≥ 140 mmHg)');
  if (vitals.bpDiastolic && vitals.bpDiastolic >= 90) warnings.push('Elevated Diastolic Blood Pressure (≥ 90 mmHg)');
  if (vitals.spo2Percentage && vitals.spo2Percentage < 94) warnings.push('Low Oxygen Saturation - Hypoxia Risk (< 94%)');
  if (vitals.tempFahrenheit && vitals.tempFahrenheit >= 100.4) warnings.push('High Body Temperature / Fever (≥ 100.4°F)');
  if (vitals.pulseRate && (vitals.pulseRate > 100 || vitals.pulseRate < 50))
    warnings.push('Abnormal Pulse Rate (< 50 or > 100 bpm)');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            Vital Signs Measurement
          </h3>
          <p className="text-xs text-slate-500">Record point-of-care vital signs measured at the health center or home visit.</p>
        </div>
      </div>

      {/* Warnings & Out of Range Badges */}
      {warnings.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-900">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Out-of-Range Vital Signs Detected:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-800">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Grid of Vitals Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Blood Pressure */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-600" />
              Blood Pressure
            </label>
            <span className="text-[11px] text-slate-400 font-medium">mmHg</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="number"
                placeholder="Systolic (120)"
                value={vitals.bpSystolic ?? ''}
                onChange={(e) => handleFieldChange('bpSystolic', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Systolic (Top)</span>
            </div>

            <span className="text-slate-400 font-bold text-lg">/</span>

            <div className="flex-1">
              <input
                type="number"
                placeholder="Diastolic (80)"
                value={vitals.bpDiastolic ?? ''}
                onChange={(e) => handleFieldChange('bpDiastolic', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Diastolic (Bottom)</span>
            </div>
          </div>
          {errors.bp && <p className="text-rose-600 text-[11px] font-medium">{errors.bp}</p>}
        </div>

        {/* Temperature */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-600" />
              Body Temperature
            </label>
            <span className="text-[11px] text-slate-400 font-medium">°F</span>
          </div>

          <input
            type="number"
            step="0.1"
            placeholder="e.g. 98.6"
            value={vitals.tempFahrenheit ?? ''}
            onChange={(e) => handleFieldChange('tempFahrenheit', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
          />
          {errors.tempFahrenheit && <p className="text-rose-600 text-[11px] font-medium">{errors.tempFahrenheit}</p>}
        </div>

        {/* Oxygen Saturation (SpO2) */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-teal-600" />
              SpO₂ Saturation
            </label>
            <span className="text-[11px] text-slate-400 font-medium">%</span>
          </div>

          <input
            type="number"
            placeholder="e.g. 98"
            value={vitals.spo2Percentage ?? ''}
            onChange={(e) => handleFieldChange('spo2Percentage', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
          />
          {errors.spo2Percentage && <p className="text-rose-600 text-[11px] font-medium">{errors.spo2Percentage}</p>}
        </div>

        {/* Pulse Rate */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Pulse Rate
            </label>
            <span className="text-[11px] text-slate-400 font-medium">bpm</span>
          </div>

          <input
            type="number"
            placeholder="e.g. 72"
            value={vitals.pulseRate ?? ''}
            onChange={(e) => handleFieldChange('pulseRate', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
          />
          {errors.pulseRate && <p className="text-rose-600 text-[11px] font-medium">{errors.pulseRate}</p>}
        </div>

        {/* Respiratory Rate */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-blue-600" />
              Respiratory Rate
            </label>
            <span className="text-[11px] text-slate-400 font-medium">breaths/min</span>
          </div>

          <input
            type="number"
            placeholder="e.g. 18"
            value={vitals.respiratoryRate ?? ''}
            onChange={(e) => handleFieldChange('respiratoryRate', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
          />
        </div>

        {/* Blood Glucose */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-purple-600" />
              Random Blood Sugar
            </label>
            <span className="text-[11px] text-slate-400 font-medium">mg/dL</span>
          </div>

          <input
            type="number"
            placeholder="e.g. 110"
            value={vitals.bloodGlucoseMgDl ?? ''}
            onChange={(e) => handleFieldChange('bloodGlucoseMgDl', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm font-semibold"
          />
        </div>
      </div>
    </div>
  );
};
