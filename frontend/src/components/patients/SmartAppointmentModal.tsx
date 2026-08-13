import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle2, Loader2, Calendar, Clock, Stethoscope, User, Volume2, X } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { APPOINTMENT_TRANSLATIONS, TranslationStrings } from '../../translations/appointmentTranslations';
import { appointmentService, AppointmentModelResponse } from '../../services/appointmentService';

interface SmartAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: AppointmentModelResponse) => void;
}

const LANGUAGE_MAP: Record<string, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Tamil: 'ta-IN',
  Marathi: 'mr-IN',
};

export const SmartAppointmentModal: React.FC<SmartAppointmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Hindi');
  const t: TranslationStrings = APPOINTMENT_TRANSLATIONS[selectedLanguage] || APPOINTMENT_TRANSLATIONS['English'];

  const [consultationType, setConsultationType] = useState<string>('tele_consultation');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [duration, setDuration] = useState<string>('3 days');
  const [severity, setSeverity] = useState<string>('Moderate');
  const [age, setAge] = useState<number | ''>(35);
  const [existingConditions, setExistingConditions] = useState<string>('Diabetes, High BP');
  const [allergies, setAllergies] = useState<string>('None');
  const [medications, setMedications] = useState<string>('Metformin 500mg');
  const [temp, setTemp] = useState<string>('99.2');
  const [spo2, setSpo2] = useState<string>('98');
  const [bp, setBp] = useState<string>('125/82');
  const [preferredDate, setPreferredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState<string>('11:30 AM');

  const [step, setStep] = useState<'input' | 'review'>('input');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { isListening, transcript, isSupported, startListening, stopListening } = useSpeechRecognition({
    language: LANGUAGE_MAP[selectedLanguage] || 'hi-IN',
    onResult: (text) => setSymptomsText(text),
  });

  useEffect(() => {
    if (transcript) {
      setSymptomsText(transcript);
    }
  }, [transcript]);

  if (!isOpen) return null;

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsText.trim()) {
      setErrorMessage('Please describe or speak your symptoms before continuing.');
      return;
    }
    setErrorMessage(null);
    setStep('review');
  };

  const handleSubmitAppointment = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        consultation_type: consultationType,
        symptoms: symptomsText,
        duration: duration,
        severity: severity,
        age: typeof age === 'number' ? age : undefined,
        existing_conditions: existingConditions ? existingConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        allergies: allergies ? allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        current_medications: medications ? medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
        vitals: {
          temperature: temp ? { value: parseFloat(temp), unit: 'F' } : null,
          spo2: spo2 ? { value: parseFloat(spo2) } : null,
          blood_pressure: bp ? { systolic: parseInt(bp.split('/')[0] || '120'), diastolic: parseInt(bp.split('/')[1] || '80') } : null,
        },
        voice_transcript: transcript || symptomsText,
        preferred_language: selectedLanguage,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
      };

      const result = await appointmentService.requestSmartAppointment(payload);
      setIsSubmitting(false);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit appointment request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 md:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              {t.title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center font-bold transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Language Selection Tabs */}
        <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
            {t.selectLanguage}
          </label>
          <div className="grid grid-cols-5 gap-1 text-xs">
            {[
              { label: 'Hindi', native: 'हिन्दी' },
              { label: 'Telugu', native: 'తెలుగు' },
              { label: 'Tamil', native: 'தமிழ்' },
              { label: 'Marathi', native: 'मराठी' },
              { label: 'English', native: 'English' },
            ].map((lang) => (
              <button
                key={lang.label}
                type="button"
                onClick={() => setSelectedLanguage(lang.label)}
                className={`py-1.5 px-1 rounded-xl text-center font-bold transition-all ${
                  selectedLanguage === lang.label
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <div className="text-[11px]">{lang.label}</div>
                <div className="text-[9px] opacity-80">{lang.native}</div>
              </button>
            ))}
          </div>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleProceedToReview} className="space-y-4 text-xs">
            {/* Consultation Mode */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t.consultationType}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsultationType('tele_consultation')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-2 ${
                    consultationType === 'tele_consultation'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  {t.teleConsultation}
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('in_person_visit')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-2 ${
                    consultationType === 'in_person_visit'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-4 h-4 text-teal-600" />
                  {t.subCenterVisit}
                </button>
              </div>
            </div>

            {/* Voice Recording Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900/5 to-teal-50 border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                  <Mic className="w-4 h-4 text-teal-600" />
                  {t.voiceInputLabel} ({selectedLanguage})
                </span>
                {isListening && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    {t.listening}
                  </span>
                )}
              </div>

              {isSupported ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`p-3 rounded-full font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${
                      isListening
                        ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse'
                        : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/30'
                    }`}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <div className="text-[11px] text-slate-600 font-semibold">
                    {isListening ? t.stopListening : t.startVoiceInput}
                    <div className="text-[10px] text-slate-400 font-normal">{t.speakPrompt}</div>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-amber-700 font-medium">
                  Voice recognition not supported in this browser. Please type your symptoms in the box below.
                </div>
              )}
            </div>

            {/* Editable Voice Transcript Area */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>{t.transcriptLabel}</span>
                <span className="text-[10px] font-semibold text-teal-700">Editable</span>
              </label>
              <textarea
                rows={3}
                placeholder={t.transcriptPlaceholder}
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-none text-xs text-slate-900 font-medium leading-relaxed"
                required
              />
            </div>

            {/* Duration & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.durationLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. 2 days, 1 week"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-medium text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.severityLabel}</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none font-bold text-xs"
                >
                  <option value="Mild">Mild (Routine Checkup)</option>
                  <option value="Moderate">Moderate (Persistent Symptoms)</option>
                  <option value="Severe">Severe (Acute Pain / High Fever)</option>
                  <option value="Urgent">Urgent (Immediate Doctor Review)</option>
                </select>
              </div>
            </div>

            {/* Medical Context (Age, Conditions, Allergies, Meds) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.ageLabel}</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.conditionsLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetes, BP"
                  value={existingConditions}
                  onChange={(e) => setExistingConditions(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Vitals */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t.vitalsLabel}</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={t.tempLabel}
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="p-2 rounded-lg border border-slate-300 text-center font-medium"
                />
                <input
                  type="text"
                  placeholder={t.spo2Label}
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="p-2 rounded-lg border border-slate-300 text-center font-medium"
                />
                <input
                  type="text"
                  placeholder={t.bpLabel}
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="p-2 rounded-lg border border-slate-300 text-center font-medium"
                />
              </div>
            </div>

            {/* Preferred Slot */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {t.preferredDate}
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  {t.preferredTime}
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-medium"
                >
                  <option value="09:30 AM">09:30 AM (Morning)</option>
                  <option value="11:30 AM">11:30 AM (Morning)</option>
                  <option value="02:30 PM">02:30 PM (Afternoon)</option>
                  <option value="04:30 PM">04:30 PM (Evening)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
              >
                {t.cancelButton}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20"
              >
                {t.reviewConfirm}
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Review & Confirm Summary */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3">
              <h4 className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                {t.confirmTitle}
              </h4>

              <div className="space-y-2 text-slate-800 font-medium">
                <div>
                  <span className="text-slate-500 font-bold block">Reported Symptoms:</span>
                  <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs italic font-serif text-slate-900">
                    "{symptomsText}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-bold">Language</span>
                    <span className="font-bold text-teal-900">{selectedLanguage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Severity</span>
                    <span className="font-bold text-slate-900">{severity} ({duration})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Mode</span>
                    <span className="font-bold text-slate-900">{consultationType === 'tele_consultation' ? 'Tele-Video Call' : 'Sub-Center Visit'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Requested Slot</span>
                    <span className="font-bold text-slate-900">{preferredDate} at {preferredTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('input')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold disabled:opacity-50"
              >
                ← Back to Edit
              </button>

              <button
                type="button"
                onClick={handleSubmitAppointment}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.submitting}
                  </>
                ) : (
                  t.submitButton
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
