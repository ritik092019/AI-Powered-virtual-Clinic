import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import {
  User,
  Activity,
  Pill,
  Languages,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  FileText,
  Heart,
  Phone,
  MapPin,
} from 'lucide-react';

interface MedicationRow {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface AllergyRow {
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
}

interface RegistrationFormData {
  // Step 1: Basic Information
  name: string;
  age: number | '';
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  village: string;
  district: string;
  abhaId: string;
  bloodGroup: string;
  emergencyContact: string;

  // Step 2: Medical History
  chronicConditions: string[];
  customCondition: string;
  previousSurgeries: string;
  familyHistory: string;
  historyNotes: string;

  // Step 3: Allergies & Medications
  medications: MedicationRow[];
  allergies: AllergyRow[];

  // Step 4: Preferred Language
  preferredLanguage: string;
  communicationNotes: string;
}

const INITIAL_FORM: RegistrationFormData = {
  name: '',
  age: '',
  dateOfBirth: '',
  gender: 'Male',
  phone: '',
  village: '',
  district: 'Surguja',
  abhaId: '',
  bloodGroup: 'B+',
  emergencyContact: '',
  chronicConditions: [],
  customCondition: '',
  previousSurgeries: '',
  familyHistory: '',
  historyNotes: '',
  medications: [],
  allergies: [],
  preferredLanguage: 'Hindi',
  communicationNotes: '',
};

const COMMON_CHRONIC_CONDITIONS = [
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Bronchial Asthma / COPD',
  'Tuberculosis (Past/Current)',
  'Ischemic Heart Disease',
  'Rheumatoid Arthritis / Joint Pain',
  'Epilepsy / Seizures',
  'Anemia',
];

const AVAILABLE_LANGUAGES = [
  { code: 'Hindi', label: 'Hindi (हिंदी)', region: 'Primary Regional' },
  { code: 'Chhattisgarhi', label: 'Chhattisgarhi (छत्तीसगढ़ी)', region: 'Local Dialect' },
  { code: 'Bengali', label: 'Bengali (বাংলা)', region: 'Settlement Areas' },
  { code: 'English', label: 'English', region: 'Official' },
  { code: 'Odia', label: 'Odia (ଓଡ଼ିଆ)', region: 'Border Belt' },
  { code: 'Gondi', label: 'Gondi / Kurukh', region: 'Tribal Dialect' },
];

export const PatientRegistrationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<RegistrationFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic Medication State
  const [medInput, setMedInput] = useState<MedicationRow>({
    name: '',
    dosage: '',
    frequency: 'Once daily (OD)',
    duration: 'Ongoing',
  });

  // Dynamic Allergy State
  const [algInput, setAlgInput] = useState<AllergyRow>({
    allergen: '',
    reaction: '',
    severity: 'moderate',
  });

  const steps = [
    { number: 1, title: 'Basic Info', icon: User },
    { number: 2, title: 'Medical History', icon: Activity },
    { number: 3, title: 'Allergies & Meds', icon: Pill },
    { number: 4, title: 'Language', icon: Languages },
    { number: 5, title: 'Review & Create', icon: CheckCircle2 },
  ];

  const updateField = (field: keyof RegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Patient full name is required.';
      if (formData.age === '' || Number(formData.age) < 0 || Number(formData.age) > 120) {
        newErrors.age = 'Please enter a valid patient age (0-120).';
      }
      if (!formData.phone.trim() || formData.phone.length < 10) {
        newErrors.phone = 'Valid 10-digit contact number is required.';
      }
      if (!formData.village.trim()) newErrors.village = 'Village / Gram Panchayat is required.';
      if (!formData.emergencyContact.trim()) {
        newErrors.emergencyContact = 'Emergency contact name & phone is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      addToast({
        title: 'Validation Error',
        message: 'Please resolve all required fields before proceeding.',
        type: 'error',
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCondition = (cond: string) => {
    setFormData((prev) => {
      const exists = prev.chronicConditions.includes(cond);
      return {
        ...prev,
        chronicConditions: exists
          ? prev.chronicConditions.filter((c) => c !== cond)
          : [...prev.chronicConditions, cond],
      };
    });
  };

  const handleAddMedication = () => {
    if (!medInput.name.trim()) {
      addToast({ title: 'Invalid Medication', message: 'Medication name cannot be empty.', type: 'warning' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, { ...medInput }],
    }));
    setMedInput({ name: '', dosage: '', frequency: 'Once daily (OD)', duration: 'Ongoing' });
  };

  const handleRemoveMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleAddAllergy = () => {
    if (!algInput.allergen.trim()) {
      addToast({ title: 'Invalid Allergy', message: 'Allergen name cannot be empty.', type: 'warning' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      allergies: [...prev.allergies, { ...algInput }],
    }));
    setAlgInput({ allergen: '', reaction: '', severity: 'moderate' });
  };

  const handleRemoveAllergy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await patientService.createPatient({
        name: formData.name,
        age: Number(formData.age),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone,
        village: formData.village,
        district: formData.district,
        abhaId: formData.abhaId || undefined,
        bloodGroup: formData.bloodGroup,
        emergencyContact: formData.emergencyContact,
        preferredLanguage: formData.preferredLanguage,
        medicalHistory: formData.chronicConditions.map((cond, idx) => ({
          id: `mh_${idx}`,
          patientId: '',
          condition: cond,
          status: 'active',
          source: 'User-Entered',
          recordedAt: new Date().toISOString().split('T')[0],
        })),
        medications: formData.medications.map((m, idx) => ({
          id: `med_${idx}`,
          patientId: '',
          name: m.name,
          dosage: m.dosage || 'Standard dosage',
          frequency: m.frequency,
          duration: m.duration,
          status: 'active',
          source: 'User-Entered',
          addedAt: new Date().toISOString().split('T')[0],
        })),
        allergies: formData.allergies.map((a, idx) => ({
          id: `alg_${idx}`,
          patientId: '',
          allergen: a.allergen,
          reaction: a.reaction || 'Mild reaction',
          severity: a.severity,
          source: 'User-Entered',
          addedAt: new Date().toISOString().split('T')[0],
        })),
        alerts: formData.allergies.length > 0
          ? [`Known allergy: ${formData.allergies.map((a) => a.allergen).join(', ')}`]
          : [],
      });

      addToast({
        title: 'Patient Registered Successfully',
        message: `Assigned ID ${created.id}. Patient profile active in offline mock registry.`,
        type: 'success',
      });

      navigate(`/patients/${created.id}`);
    } catch (err) {
      addToast({
        title: 'Registration Failed',
        message: 'Could not create patient record in mock storage.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Stepper */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {steps.map((s, idx) => {
            const IconComp = s.icon;
            const isActive = currentStep === s.number;
            const isDone = currentStep > s.number;

            return (
              <React.Fragment key={s.number}>
                <div
                  onClick={() => {
                    if (s.number < currentStep || validateStep(currentStep)) {
                      setCurrentStep(s.number);
                    }
                  }}
                  className={`flex items-center space-x-2 shrink-0 cursor-pointer p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-bold'
                      : isDone
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                  </div>
                  <span className="text-xs sm:text-sm whitespace-nowrap">{s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-slate-200 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Content Card */}
      <Card variant="flat" className="p-6 bg-white shadow-sm border border-slate-200">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" /> Basic Patient Information
              </h3>
              <p className="text-xs text-slate-500">
                Primary demographic identifiers, contact details, and location mapping.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  error={errors.name}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age (Years) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 54"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value === '' ? '' : Number(e.target.value))}
                    error={errors.age}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    value={formData.gender}
                    onChange={(e) => updateField('gender', e.target.value as any)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="+91 98234 11223"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  error={errors.phone}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth (Optional)</label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Village / Gram Panchayat <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Rampur"
                  value={formData.village}
                  onChange={(e) => updateField('village', e.target.value)}
                  error={errors.village}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <Input
                  placeholder="e.g. Surguja"
                  value={formData.district}
                  onChange={(e) => updateField('district', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ABHA Health ID (Optional)</label>
                <Input
                  placeholder="e.g. 91-2384-9021-1123"
                  value={formData.abhaId}
                  onChange={(e) => updateField('abhaId', e.target.value)}
                />
                <p className="text-[11px] text-slate-400 mt-1">14-digit Ayushman Bharat Health Account number if available.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={formData.bloodGroup}
                  onChange={(e) => updateField('bloodGroup', e.target.value)}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Details <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Suraj Patel (Son) - +91 98234 99881"
                  value={formData.emergencyContact}
                  onChange={(e) => updateField('emergencyContact', e.target.value)}
                  error={errors.emergencyContact}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Medical History */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" /> Recorded Medical History
              </h3>
              <p className="text-xs text-slate-500">
                Known chronic conditions, prior hospitalizations, or family history.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Select Known Chronic Conditions</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_CHRONIC_CONDITIONS.map((cond) => {
                  const selected = formData.chronicConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`p-3 rounded-lg text-left text-xs font-medium border transition-all flex items-center justify-between ${
                        selected
                          ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span>{cond}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Previous Surgeries / Hospitalization</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Appendectomy in 2018 at District Hospital."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={formData.previousSurgeries}
                  onChange={(e) => updateField('previousSurgeries', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Family Medical History</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Father had Type 2 Diabetes; Mother hypertension."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={formData.familyHistory}
                  onChange={(e) => updateField('familyHistory', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Allergies & Medications */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" /> Current Medications & Allergies
              </h3>
              <p className="text-xs text-slate-500">
                Log active drug routines and documented hypersensitivities.
              </p>
            </div>

            {/* Current Medications Section */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
                <span>Active Medications ({formData.medications.length})</span>
              </h4>

              {formData.medications.length > 0 && (
                <div className="space-y-2">
                  {formData.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-md border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{med.name}</span>{' '}
                        <span className="text-slate-500">({med.dosage})</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {med.frequency} • {med.duration}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMedication(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Medication Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                <Input
                  placeholder="Medication Name"
                  value={medInput.name}
                  onChange={(e) => setMedInput({ ...medInput, name: e.target.value })}
                />
                <Input
                  placeholder="Dosage (e.g. 500mg)"
                  value={medInput.dosage}
                  onChange={(e) => setMedInput({ ...medInput, dosage: e.target.value })}
                />
                <select
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  value={medInput.frequency}
                  onChange={(e) => setMedInput({ ...medInput, frequency: e.target.value })}
                >
                  <option value="Once daily (OD)">Once daily (OD)</option>
                  <option value="Twice daily (BD)">Twice daily (BD)</option>
                  <option value="Thrice daily (TDS)">Thrice daily (TDS)</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddMedication}
                >
                  Add Med
                </Button>
              </div>
            </div>

            {/* Allergies Section */}
            <div className="space-y-3 bg-rose-50/50 p-4 rounded-lg border border-rose-200">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                Documented Allergies ({formData.allergies.length})
              </h4>

              {formData.allergies.length > 0 && (
                <div className="space-y-2">
                  {formData.allergies.map((alg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-md border border-rose-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-rose-900">{alg.allergen}</span>
                        <Badge
                          variant={
                            alg.severity === 'life-threatening' || alg.severity === 'severe'
                              ? 'danger'
                              : 'warning'
                          }
                          className="ml-2"
                        >
                          {alg.severity}
                        </Badge>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Reaction: {alg.reaction || 'Not specified'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAllergy(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Allergy Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-rose-200">
                <Input
                  placeholder="Allergen (e.g. Penicillin)"
                  value={algInput.allergen}
                  onChange={(e) => setAlgInput({ ...algInput, allergen: e.target.value })}
                />
                <Input
                  placeholder="Reaction (e.g. Rash)"
                  value={algInput.reaction}
                  onChange={(e) => setAlgInput({ ...algInput, reaction: e.target.value })}
                />
                <select
                  className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                  value={algInput.severity}
                  onChange={(e) => setAlgInput({ ...algInput, severity: e.target.value as any })}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="life-threatening">Life Threatening</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddAllergy}
                >
                  Add Allergy
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preferred Language */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Languages className="w-5 h-5 text-teal-600" /> Preferred Spoken Language
              </h3>
              <p className="text-xs text-slate-500">
                Ensures AI translation and doctor communication align with patient literacy & dialect.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = formData.preferredLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => updateField('preferredLanguage', lang.code)}
                    className={`p-4 rounded-lg text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs ring-1 ring-teal-500'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{lang.label}</div>
                      <div className="text-[11px] text-slate-500">{lang.region}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Communication Notes / Dialect Nuances
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Prefers spoken audio instructions over text. Relatives assist with reading."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={formData.communicationNotes}
                onChange={(e) => updateField('communicationNotes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 5: Review & Create */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600" /> Review Patient Summary
              </h3>
              <p className="text-xs text-slate-500">
                Verify all information before creating patient record in mock registry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Demographic Details
                </h4>
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Age & Gender:</strong> {formData.age} yrs, {formData.gender}
                </p>
                <p>
                  <strong>Phone:</strong> {formData.phone}
                </p>
                <p>
                  <strong>Location:</strong> {formData.village}, {formData.district}
                </p>
                <p>
                  <strong>ABHA ID:</strong> {formData.abhaId || 'None Provided'}
                </p>
                <p>
                  <strong>Emergency Contact:</strong> {formData.emergencyContact}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Clinical Background
                </h4>
                <p>
                  <strong>Preferred Language:</strong> {formData.preferredLanguage}
                </p>
                <p>
                  <strong>Chronic Conditions:</strong>{' '}
                  {formData.chronicConditions.join(', ') || 'None Selected'}
                </p>
                <p>
                  <strong>Medications Logged:</strong> {formData.medications.length} active item(s)
                </p>
                <p>
                  <strong>Allergies Logged:</strong> {formData.allergies.length} item(s)
                </p>
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-md text-xs text-teal-900">
              <strong>Offline Mode Note:</strong> This record will be cached locally and available
              immediately for clinical consultations.
            </div>
          </div>
        )}

        {/* Navigation Actions Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => navigate('/patients') : handleBack}
            disabled={isSubmitting}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < 5 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Create Patient
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
