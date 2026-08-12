import React, { useState } from 'react';
import { Patient, MedicationItem, AllergyItem } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import { Pill, AlertTriangle, Plus, Trash2, X, CheckCircle2 } from 'lucide-react';

interface PatientMedicationsAllergiesTabProps {
  patient: Patient;
  onRefresh: () => void;
}

export const PatientMedicationsAllergiesTab: React.FC<PatientMedicationsAllergiesTabProps> = ({
  patient,
  onRefresh,
}) => {
  const { addToast } = useNotification();

  // Add Medication State
  const [showMedModal, setShowMedModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily (OD)');
  const [medDuration, setMedDuration] = useState('Ongoing');

  // Add Allergy State
  const [showAlgModal, setShowAlgModal] = useState(false);
  const [algName, setAlgName] = useState('');
  const [algReaction, setAlgReaction] = useState('');
  const [algSeverity, setAlgSeverity] = useState<'mild' | 'moderate' | 'severe' | 'life-threatening'>('moderate');

  const [isLoading, setIsLoading] = useState(false);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      addToast({ title: 'Validation Error', message: 'Medication name is required.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      await patientService.addMedicationItem(patient.id, {
        name: medName,
        dosage: medDosage || 'As directed',
        frequency: medFreq,
        duration: medDuration,
        status: 'active',
      });

      addToast({ title: 'Medication Added', message: `Added ${medName} to active routine.`, type: 'success' });
      setMedName('');
      setMedDosage('');
      setShowMedModal(false);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to add medication.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!algName.trim()) {
      addToast({ title: 'Validation Error', message: 'Allergen name is required.', type: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      await patientService.addAllergyItem(patient.id, {
        allergen: algName,
        reaction: algReaction || 'General hypersensitivity',
        severity: algSeverity,
      });

      addToast({ title: 'Allergy Logged', message: `Recorded allergy: ${algName}.`, type: 'success' });
      setAlgName('');
      setAlgReaction('');
      setShowAlgModal(false);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to log allergy.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const medications = patient.medications || [];
  const allergies = patient.allergies || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Medications Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" /> Active Medications Routine
            </h3>
            <p className="text-xs text-slate-500">
              User-entered home medications and prescriptions recorded during intake.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowMedModal(true)}
          >
            Add Medication
          </Button>
        </div>

        {medications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medications.map((med) => (
              <Card key={med.id} variant="flat" className="p-4 bg-white border border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{med.name}</h4>
                    <span className="text-xs text-slate-600 font-medium">
                      Dosage: {med.dosage} • Frequency: {med.frequency}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Duration: {med.duration || 'Ongoing'} • Added: {med.addedAt}
                    </div>
                  </div>
                  <Badge variant={med.status === 'active' ? 'success' : 'neutral'}>
                    {med.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="flat" className="p-6 text-center bg-slate-50 border-dashed border-slate-200 text-xs text-slate-500">
            No active routine medications logged.
          </Card>
        )}
      </div>

      {/* Allergies Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Documented Allergies & Sensitivities
            </h3>
            <p className="text-xs text-slate-500">
              Hypersensitivity flags to prevent adverse drug reactions.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAlgModal(true)}
            className="border-rose-300 text-rose-800 hover:bg-rose-50"
          >
            Log Allergy
          </Button>
        </div>

        {allergies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergies.map((alg) => (
              <Card key={alg.id} variant="flat" className="p-4 bg-white border border-rose-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">{alg.allergen}</h4>
                    <p className="text-xs text-slate-700 mt-0.5">Reaction: {alg.reaction}</p>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Logged Date: {alg.addedAt}
                    </div>
                  </div>
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
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="flat" className="p-6 text-center bg-rose-50/30 border-dashed border-rose-200 text-xs text-slate-500">
            No drug or environmental allergies logged for this patient.
          </Card>
        )}
      </div>

      {/* Add Medication Modal */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-md bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Active Medication</h3>
              <button onClick={() => setShowMedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medication Name *</label>
                <Input
                  placeholder="e.g. Amlodipine"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                  <Input
                    placeholder="e.g. 5mg"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                  >
                    <option value="Once daily (OD)">Once daily (OD)</option>
                    <option value="Twice daily (BD)">Twice daily (BD)</option>
                    <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                <Input
                  placeholder="e.g. Ongoing or 10 days"
                  value={medDuration}
                  onChange={(e) => setMedDuration(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowMedModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isLoading}>
                  Save Medication
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Allergy Modal */}
      {showAlgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-md bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Log Allergy</h3>
              <button onClick={() => setShowAlgModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAllergy} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Allergen / Substance *</label>
                <Input
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
                  value={algName}
                  onChange={(e) => setAlgName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observed Reaction</label>
                <Input
                  placeholder="e.g. Facial swelling, skin rash, bronchospasm"
                  value={algReaction}
                  onChange={(e) => setAlgReaction(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Level</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  value={algSeverity}
                  onChange={(e) => setAlgSeverity(e.target.value as any)}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="life-threatening">Life Threatening</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowAlgModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isLoading}>
                  Save Allergy
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
