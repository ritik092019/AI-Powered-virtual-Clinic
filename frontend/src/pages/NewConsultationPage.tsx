import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ConsultationDraft, Patient, VitalSigns, Symptom, MedicalDocument, PatientImage } from '../types';
import { consultationService } from '../services/consultationService';
import { patientService } from '../services/patientService';
import { useNotification } from '../context/NotificationContext';
import { ConsultationStepper, CONSULTATION_STEPS } from '../components/consultations/ConsultationStepper';
import { PatientSelector } from '../components/consultations/PatientSelector';
import { SymptomSelector } from '../components/consultations/SymptomSelector';
import { MedicalHistorySelector } from '../components/consultations/MedicalHistorySelector';
import { MedicationsAllergiesSelector } from '../components/consultations/MedicationsAllergiesSelector';
import { VitalInput } from '../components/consultations/VitalInput';
import { VoiceRecorder } from '../components/consultations/VoiceRecorder';
import { DocumentUploaderAndOCR } from '../components/consultations/DocumentUploaderAndOCR';
import { ImageUploaderAndAnalysis } from '../components/consultations/ImageUploaderAndAnalysis';
import { ReviewCard } from '../components/consultations/ReviewCard';
import { ProcessingStatus } from '../components/consultations/ProcessingStatus';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ArrowRight, Save, Sparkles, RefreshCcw, Check, ShieldAlert } from 'lucide-react';

export const NewConsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const preSelectedPatientId = searchParams.get('patientId');

  // Wizard Navigation State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(undefined);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [hasExistingDraft, setHasExistingDraft] = useState(false);

  // Form Data State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [additionalHistory, setAdditionalHistory] = useState<any[]>([]);
  const [confirmedMedications, setConfirmedMedications] = useState<any[]>([]);
  const [confirmedAllergies, setConfirmedAllergies] = useState<any[]>([]);
  const [noKnownAllergies, setNoKnownAllergies] = useState<boolean>(false);
  const [vitals, setVitals] = useState<VitalSigns>({});
  const [voiceTranscript, setVoiceTranscript] = useState<any | undefined>(undefined);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [images, setImages] = useState<PatientImage[]>([]);
  const [imageObservations, setImageObservations] = useState<any[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdConsultationId, setCreatedConsultationId] = useState<string | undefined>(undefined);

  // Check for saved draft on mount
  useEffect(() => {
    const savedDraft = consultationService.getDraft();
    if (savedDraft && savedDraft.patientId) {
      setHasExistingDraft(true);
    }
  }, []);

  // Load preselected patient if query param passed
  useEffect(() => {
    if (preSelectedPatientId && !selectedPatient) {
      patientService.getPatientById(preSelectedPatientId).then((p) => {
        if (p) setSelectedPatient(p);
      });
    }
  }, [preSelectedPatientId]);

  // Handle Resume Draft
  const handleResumeDraft = () => {
    const saved = consultationService.getDraft();
    if (!saved) return;

    if (saved.patientId) {
      patientService.getPatientById(saved.patientId).then((p) => {
        if (p) setSelectedPatient(p);
      });
    }

    setChiefComplaint(saved.chiefComplaint || '');
    setPriority(saved.priority || 'routine');
    setSymptoms(saved.symptoms || []);
    setVitals(saved.vitals || {});
    setAdditionalHistory(saved.additionalMedicalHistory || []);
    setConfirmedMedications(saved.confirmedMedications || []);
    setConfirmedAllergies(saved.confirmedAllergies || []);
    setNoKnownAllergies(saved.noKnownAllergies || false);
    setVoiceTranscript(saved.voiceTranscript);
    setDocuments(saved.documents || []);
    setImages(saved.images || []);
    setImageObservations(saved.imageObservations || []);

    if (saved.currentStepIndex !== undefined) {
      setCurrentStepIndex(saved.currentStepIndex);
    }
    if (saved.completedSteps) {
      setCompletedSteps(saved.completedSteps);
    }
    setLastSavedAt(saved.lastSavedAt);
    setHasExistingDraft(false);

    addToast({
      title: 'Draft Resumed',
      message: 'Restored saved consultation intake draft from local storage.',
      type: 'info',
    });
  };

  // Handle Start Fresh
  const handleDiscardDraft = () => {
    consultationService.clearDraft();
    setHasExistingDraft(false);
  };

  // Explicit Save Draft
  const handleSaveDraft = () => {
    setIsSavingDraft(true);

    const draftPayload: ConsultationDraft = {
      patientId: selectedPatient?.id,
      patientName: selectedPatient?.name,
      patientAge: selectedPatient?.age,
      patientGender: selectedPatient?.gender,
      chiefComplaint,
      priority,
      symptoms,
      vitals,
      additionalMedicalHistory: additionalHistory,
      confirmedMedications,
      confirmedAllergies,
      noKnownAllergies,
      voiceTranscript,
      documents,
      images,
      imageObservations,
      currentStepIndex,
      completedSteps,
    };

    consultationService.saveDraft(draftPayload);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedAt(timeStr);

    setTimeout(() => {
      setIsSavingDraft(false);
      addToast({
        title: 'Draft Saved',
        message: `Progress saved locally at ${timeStr}.`,
        type: 'success',
      });
    }, 400);
  };

  // Validation Before Step Advancement
  const canAdvance = () => {
    // Step 0: Patient Selection
    if (currentStepIndex === 0 && !selectedPatient) {
      return false;
    }
    // Step 1: Chief Complaint
    if (currentStepIndex === 1 && !chiefComplaint.trim()) {
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!canAdvance()) {
      if (currentStepIndex === 0) {
        addToast({
          title: 'Patient Required',
          message: 'Please search and select a patient before continuing.',
          type: 'warning',
        });
      } else if (currentStepIndex === 1) {
        addToast({
          title: 'Chief Complaint Required',
          message: 'Please enter the primary chief complaint before continuing.',
          type: 'warning',
        });
      }
      return;
    }

    // Mark current step as completed
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps([...completedSteps, currentStepIndex]);
    }

    if (currentStepIndex < CONSULTATION_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Auto save draft on step change
      handleSaveDraft();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit to Consultation Service
  const handleSubmitConsultation = async () => {
    if (!selectedPatient) return;

    setIsSubmitting(true);
    try {
      const created = await consultationService.createConsultation({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        patientAge: selectedPatient.age,
        patientGender: selectedPatient.gender,
        chiefComplaint,
        priority,
        symptoms,
        vitals,
        additionalMedicalHistory: additionalHistory,
        confirmedMedications,
        confirmedAllergies,
        noKnownAllergies,
        voiceTranscript,
        documents,
        images,
        imageObservations,
        status: 'submitted',
      });

      setCreatedConsultationId(created.id);
      addToast({
        title: 'Consultation Submitted',
        message: `Consultation ${created.id} queued for doctor authorization.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Submission Error',
        message: err.message || 'Failed to submit consultation.',
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Clinical Intake Workflow</h1>
          <p className="text-xs text-slate-500">
            Multi-stage tele-health worker consultation recorder for rural primary care.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/consultations')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Queue
        </Button>
      </div>

      {/* Resume Draft Banner */}
      {hasExistingDraft && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">Saved Consultation Draft Detected</span>
              <span>You have an unsubmitted consultation draft saved in local browser storage.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button variant="primary" size="sm" onClick={handleResumeDraft} leftIcon={<RefreshCcw className="w-3.5 h-3.5" />}>
              Resume Draft
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDiscardDraft} className="text-slate-600">
              Start Fresh
            </Button>
          </div>
        </div>
      )}

      {/* Persistent Stepper Bar */}
      <ConsultationStepper
        currentStepIndex={currentStepIndex}
        completedSteps={completedSteps}
        onStepClick={(stepIdx) => setCurrentStepIndex(stepIdx)}
        onSaveDraft={handleSaveDraft}
        lastSavedAt={lastSavedAt}
        isSavingDraft={isSavingDraft}
      />

      {/* Step Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        {/* Step 0: Patient Selection */}
        {currentStepIndex === 0 && (
          <PatientSelector
            selectedPatient={selectedPatient}
            onSelectPatient={(p) => setSelectedPatient(p)}
            preSelectedPatientId={preSelectedPatientId}
          />
        )}

        {/* Step 1: Chief Complaint */}
        {currentStepIndex === 1 && (
          <SymptomSelector
            chiefComplaint={chiefComplaint}
            onChangeChiefComplaint={setChiefComplaint}
            symptoms={symptoms}
            onChangeSymptoms={setSymptoms}
            priority={priority}
            onChangePriority={setPriority}
          />
        )}

        {/* Step 2: Symptoms Detailed */}
        {currentStepIndex === 2 && (
          <SymptomSelector
            chiefComplaint={chiefComplaint}
            onChangeChiefComplaint={setChiefComplaint}
            symptoms={symptoms}
            onChangeSymptoms={setSymptoms}
            priority={priority}
            onChangePriority={setPriority}
          />
        )}

        {/* Step 3: Medical History */}
        {currentStepIndex === 3 && (
          <MedicalHistorySelector
            patient={selectedPatient}
            additionalHistory={additionalHistory}
            onChangeAdditionalHistory={setAdditionalHistory}
          />
        )}

        {/* Step 4: Medications & Allergies */}
        {currentStepIndex === 4 && (
          <MedicationsAllergiesSelector
            patient={selectedPatient}
            confirmedMedications={confirmedMedications}
            onChangeConfirmedMedications={setConfirmedMedications}
            confirmedAllergies={confirmedAllergies}
            onChangeConfirmedAllergies={setConfirmedAllergies}
            noKnownAllergies={noKnownAllergies}
            onChangeNoKnownAllergies={setNoKnownAllergies}
          />
        )}

        {/* Step 5: Vital Signs */}
        {currentStepIndex === 5 && <VitalInput vitals={vitals} onChangeVitals={setVitals} />}

        {/* Step 6: Voice Recording */}
        {currentStepIndex === 6 && (
          <VoiceRecorder
            confirmedVoiceData={voiceTranscript}
            onConfirmVoiceData={(voiceData) => setVoiceTranscript(voiceData)}
            onClearVoiceData={() => setVoiceTranscript(undefined)}
          />
        )}

        {/* Step 7: Documents & OCR */}
        {currentStepIndex === 7 && (
          <DocumentUploaderAndOCR
            documents={documents}
            onChangeDocuments={setDocuments}
            onConfirmOcrData={(ocrData) => {
              addToast({
                title: 'OCR Data Appended',
                message: 'Extracted prescription/lab findings appended to intake packet.',
                type: 'success',
              });
            }}
          />
        )}

        {/* Step 8: Images & Observation */}
        {currentStepIndex === 8 && (
          <ImageUploaderAndAnalysis
            images={images}
            onChangeImages={setImages}
            imageObservations={imageObservations}
            onChangeImageObservations={setImageObservations}
          />
        )}

        {/* Step 9: Review Summary */}
        {currentStepIndex === 9 && (
          <ReviewCard
            draft={{
              chiefComplaint,
              priority,
              symptoms,
              vitals,
              confirmedMedications,
              confirmedAllergies,
              noKnownAllergies,
              voiceTranscript,
              documents,
              images,
              imageObservations,
            }}
            patient={selectedPatient}
            onNavigateToStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
          />
        )}

        {/* Step 10: AI Submission & Status */}
        {currentStepIndex === 10 && (
          <ProcessingStatus
            consultationId={createdConsultationId}
            isSubmitting={isSubmitting}
            onFinishSubmission={() => {
              addToast({
                title: 'AI Assessment Completed',
                message: 'Intake consultation packet ready for doctor authorization.',
                type: 'success',
              });
            }}
          />
        )}
      </div>

      {/* Footer Navigation Buttons */}
      {currentStepIndex < 10 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="md"
            disabled={currentStepIndex === 0}
            onClick={handlePrevStep}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous Stage
          </Button>

          {currentStepIndex === 9 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                handleNextStep();
                handleSubmitConsultation();
              }}
              leftIcon={<Sparkles className="w-4 h-4" />}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            >
              Submit for AI Analysis & Doctor Review
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={!canAdvance()}
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next Stage
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
