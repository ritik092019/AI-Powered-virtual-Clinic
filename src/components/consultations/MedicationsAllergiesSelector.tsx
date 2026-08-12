import React, { useState } from 'react';
import { AllergyItem, MedicationItem, Patient } from '../../types';
import { Pill, AlertOctagon, Plus, X, Check, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface MedicationsAllergiesSelectorProps {
  patient: Patient | null;
  confirmedMedications: MedicationItem[];
  onChangeConfirmedMedications: (meds: MedicationItem[]) => void;
  confirmedAllergies: AllergyItem[];
  onChangeConfirmedAllergies: (allergies: AllergyItem[]) => void;
  noKnownAllergies: boolean;
  onChangeNoKnownAllergies: (val: boolean) => void;
}

export const MedicationsAllergiesSelector: React.FC<MedicationsAllergiesSelectorProps> = ({
  patient,
  confirmedMedications,
  onChangeConfirmedMedications,
  confirmedAllergies,
  onChangeConfirmedAllergies,
  noKnownAllergies,
  onChangeNoKnownAllergies,
}) => {
  // Local state for adding new medication
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');

  // Local state for adding new allergy
  const [newAllergen, setNewAllergen] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [newSeverity, setNewSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;

    const newItem: MedicationItem = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || 'Standard dose',
      frequency: newMedFrequency.trim() || 'Once daily',
      isCurrent: true,
      prescribedBy: 'Current Intake Entry',
    };

    onChangeConfirmedMedications([...confirmedMedications, newItem]);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('');
  };

  const handleAddAllergy = () => {
    if (!newAllergen.trim()) return;

    const newItem: AllergyItem = {
      id: `alg-${Date.now()}`,
      allergen: newAllergen.trim(),
      reaction: newReaction.trim() || 'Skin rash / discomfort',
      severity: newSeverity,
    };

    onChangeConfirmedAllergies([...confirmedAllergies, newItem]);
    onChangeNoKnownAllergies(false); // Uncheck NKDA if allergy added
    setNewAllergen('');
    setNewReaction('');
  };

  const handleRemoveMedication = (id: string) => {
    onChangeConfirmedMedications(confirmedMedications.filter((m) => m.id !== id));
  };

  const handleRemoveAllergy = (id: string) => {
    onChangeConfirmedAllergies(confirmedAllergies.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: MEDICATIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            Current Medications ({confirmedMedications.length})
          </label>
          <span className="text-xs text-slate-500">Regular drugs taken by patient</span>
        </div>

        {/* Existing Medications Checkboxes */}
        {patient?.currentMedications && patient.currentMedications.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">From Patient Profile Record</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patient.currentMedications.map((med) => {
                const isConfirmed = confirmedMedications.some((m) => m.name.toLowerCase() === med.name.toLowerCase());

                return (
                  <div
                    key={med.id}
                    onClick={() => {
                      if (isConfirmed) {
                        onChangeConfirmedMedications(
                          confirmedMedications.filter((m) => m.name.toLowerCase() !== med.name.toLowerCase())
                        );
                      } else {
                        onChangeConfirmedMedications([...confirmedMedications, med]);
                      }
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isConfirmed
                        ? 'border-teal-600 bg-teal-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900">{med.name}</span>
                      <p className="text-slate-500">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center border ${
                        isConfirmed
                          ? 'bg-teal-600 border-teal-600 text-white'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Form to Add New Medication */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 text-xs">
          <span className="font-bold text-slate-800 block">Add New Medication for Current Intake</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Drug Name (e.g. Paracetamol)"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 500mg)"
              value={newMedDosage}
              onChange={(e) => setNewMedDosage(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. BD - Twice daily)"
              value={newMedFrequency}
              onChange={(e) => setNewMedFrequency(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!newMedName.trim()}
            onClick={handleAddMedication}
            leftIcon={<Plus className="w-3.5 h-3.5 text-teal-600" />}
          >
            Add Medication
          </Button>
        </div>

        {/* Confirmed List */}
        {confirmedMedications.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-teal-800">Confirmed Active Medications for this Consultation:</span>
            <div className="flex flex-wrap gap-2">
              {confirmedMedications.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 text-xs font-semibold"
                >
                  {m.name} ({m.dosage})
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(m.id)}
                    className="hover:text-rose-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: ALLERGIES */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Allergies & Drug Sensitivities ({confirmedAllergies.length})
          </label>
          <span className="text-xs text-rose-600 font-semibold">Critical Medical Safety Check</span>
        </div>

        {/* Explicit No Known Drug Allergies (NKDA) Box */}
        <div
          onClick={() => {
            const nextVal = !noKnownAllergies;
            onChangeNoKnownAllergies(nextVal);
            if (nextVal) {
              onChangeConfirmedAllergies([]); // Clear if NKDA
            }
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
            noKnownAllergies
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`w-5 h-5 ${noKnownAllergies ? 'text-emerald-600' : 'text-slate-300'}`} />
            <div>
              <span className="block font-bold">Explicitly Confirm &quot;No Known Allergies&quot; (NKDA)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Check this box ONLY after explicitly confirming with the patient that they have no known drug/food allergies.
              </span>
            </div>
          </div>
          <span className="text-xs text-emerald-700 font-semibold">{noKnownAllergies ? 'Confirmed NKDA' : 'Select'}</span>
        </div>

        {/* Add New Allergy Form */}
        {!noKnownAllergies && (
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3 text-xs">
            <span className="font-bold text-rose-900 block">Add Drug or Food Allergy</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Allergen (e.g. Penicillin, Sulfa)"
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
              />
              <input
                type="text"
                placeholder="Reaction (e.g. Hives, Anaphylaxis)"
                value={newReaction}
                onChange={(e) => setNewReaction(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
              />
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-800"
              >
                <option value="mild">Mild (हल्का)</option>
                <option value="moderate">Moderate (मध्यम)</option>
                <option value="severe">Severe (गंभीर)</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!newAllergen.trim()}
              onClick={handleAddAllergy}
              leftIcon={<Plus className="w-3.5 h-3.5 text-rose-600" />}
            >
              Add Allergy
            </Button>
          </div>
        )}

        {/* Confirmed Allergy Badges */}
        {confirmedAllergies.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-rose-800">Confirmed Allergy Alerts for this Intake:</span>
            <div className="flex flex-wrap gap-2">
              {confirmedAllergies.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 text-xs font-bold border border-rose-200"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  {a.allergen} ({a.severity}) - {a.reaction}
                  <button
                    type="button"
                    onClick={() => handleRemoveAllergy(a.id)}
                    className="hover:text-rose-900 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
