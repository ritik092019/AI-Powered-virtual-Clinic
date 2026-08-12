import React, { useState } from 'react';
import { Patient } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import { Edit3, X, Save, AlertCircle } from 'lucide-react';

interface EditPatientModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { addToast } = useNotification();
  const [name, setName] = useState(patient.name);
  const [age, setAge] = useState(patient.age);
  const [gender, setGender] = useState(patient.gender);
  const [phone, setPhone] = useState(patient.phone);
  const [village, setVillage] = useState(patient.village);
  const [district, setDistrict] = useState(patient.district);
  const [preferredLanguage, setPreferredLanguage] = useState(patient.preferredLanguage || 'Hindi');
  const [abhaId, setAbhaId] = useState(patient.abhaId || '');
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup || 'B+');
  const [emergencyContact, setEmergencyContact] = useState(patient.emergencyContact || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !village.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Name, Phone, and Village are required fields.',
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);
    try {
      await patientService.updatePatient(patient.id, {
        name,
        age: Number(age),
        gender,
        phone,
        village,
        district,
        preferredLanguage,
        abhaId: abhaId || undefined,
        bloodGroup,
        emergencyContact,
      });

      addToast({
        title: 'Demographics Updated',
        message: `Updated profile details for ${name}.`,
        type: 'success',
      });

      onUpdated();
      onClose();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update patient details.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <Card variant="flat" className="w-full max-w-lg bg-white p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-teal-600" /> Edit Patient Demographics
            </h3>
            <p className="text-xs text-slate-500">Patient ID: {patient.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Updating demographic details here will not overwrite historical consultation records or medical prescriptions.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age *</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                <option value="Hindi">Hindi</option>
                <option value="Chhattisgarhi">Chhattisgarhi</option>
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
                <option value="Odia">Odia</option>
                <option value="Gondi">Gondi / Kurukh</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Village *</label>
              <Input value={village} onChange={(e) => setVillage(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">District</label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ABHA Health ID</label>
              <Input value={abhaId} onChange={(e) => setAbhaId(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
              <Input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
