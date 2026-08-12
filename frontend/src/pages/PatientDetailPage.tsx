import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Patient } from '../types';
import { patientService } from '../services/patientService';
import { useNotification } from '../context/NotificationContext';
import { PatientProfileHeader } from '../components/patients/PatientProfileHeader';
import { PatientOverviewTab } from '../components/patients/PatientOverviewTab';
import { PatientMedicalHistoryTab } from '../components/patients/PatientMedicalHistoryTab';
import { PatientMedicationsAllergiesTab } from '../components/patients/PatientMedicationsAllergiesTab';
import { PatientDocumentsTab } from '../components/patients/PatientDocumentsTab';
import { PatientImagesTab } from '../components/patients/PatientImagesTab';
import { PatientConsultationsTab } from '../components/patients/PatientConsultationsTab';
import { PatientTimelineTab } from '../components/patients/PatientTimelineTab';
import { EditPatientModal } from '../components/patients/EditPatientModal';
import { ConfirmationDialog } from '../components/patients/ConfirmationDialog';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  User,
  Activity,
  Pill,
  FileText,
  Camera,
  Stethoscope,
  Clock,
  Trash2,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';

type TabKey =
  | 'overview'
  | 'history'
  | 'medications'
  | 'documents'
  | 'images'
  | 'consultations'
  | 'timeline';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Modal State Triggers
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showDoctorReqModal, setShowDoctorReqModal] = useState<boolean>(false);
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [imgModalOpen, setImgModalOpen] = useState<boolean>(false);

  // Doctor Request Form State
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>('General Medicine');
  const [doctorPriority, setDoctorPriority] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [isSubmittingDoctorReq, setIsSubmittingDoctorReq] = useState<boolean>(false);

  const fetchPatientDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await patientService.getPatientById(id);
      if (!data) {
        addToast({ title: 'Patient Not Found', message: `No record matching ${id}.`, type: 'error' });
        navigate('/patients');
        return;
      }
      setPatient(data);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to load patient record.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetail();
  }, [id]);

  const handleDeletePatientConfirm = async () => {
    if (!patient) return;
    try {
      await patientService.deletePatient(patient.id);
      addToast({
        title: 'Patient Deleted',
        message: `Removed patient ${patient.name} (${patient.id}) from local registry.`,
        type: 'info',
      });
      navigate('/patients');
    } catch (err) {
      addToast({ title: 'Error', message: 'Could not delete patient record.', type: 'error' });
    }
  };

  const handleDoctorRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSubmittingDoctorReq(true);
    try {
      await new Promise((res) => setTimeout(res, 300));
      addToast({
        title: 'Tele-Doctor Consultation Requested',
        message: `Escalated ${patient.name} to ${doctorSpecialty} queue (${doctorPriority} priority).`,
        type: 'success',
      });
      setShowDoctorReqModal(false);
      setDoctorNotes('');
      fetchPatientDetail();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to request tele-doctor.', type: 'error' });
    } finally {
      setIsSubmittingDoctorReq(false);
    }
  };

  if (isLoading || !patient) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/patients')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Patients
        </Button>
        <Card variant="flat" className="p-8 text-center bg-white">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading Patient Profile...</p>
        </Card>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: any; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'history', label: 'Medical History', icon: Activity, count: patient.medicalHistory?.length },
    { key: 'medications', label: 'Meds & Allergies', icon: Pill, count: (patient.medications?.length || 0) + (patient.allergies?.length || 0) },
    { key: 'documents', label: 'Documents', icon: FileText, count: patient.documents?.length },
    { key: 'images', label: 'Images', icon: Camera, count: patient.images?.length },
    { key: 'consultations', label: 'Consultations', icon: Stethoscope },
    { key: 'timeline', label: 'Timeline', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Top Back Nav & Delete Option */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/patients')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Patient Registry
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-rose-600 hover:bg-rose-50"
          onClick={() => setShowDeleteDialog(true)}
          leftIcon={<Trash2 className="w-4 h-4" />}
        >
          Delete Record
        </Button>
      </div>

      {/* Patient Profile Header */}
      <PatientProfileHeader
        patient={patient}
        onStartConsultation={() => navigate('/consultations')}
        onUploadDocument={() => {
          setActiveTab('documents');
          setDocModalOpen(true);
        }}
        onUploadImage={() => {
          setActiveTab('images');
          setImgModalOpen(true);
        }}
        onRequestDoctor={() => setShowDoctorReqModal(true)}
        onEditProfile={() => setShowEditModal(true)}
      />

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panel Content Rendering */}
      <div>
        {activeTab === 'overview' && (
          <PatientOverviewTab
            patient={patient}
            onNavigateTab={(k) => setActiveTab(k as TabKey)}
          />
        )}

        {activeTab === 'history' && (
          <PatientMedicalHistoryTab patient={patient} onRefresh={fetchPatientDetail} />
        )}

        {activeTab === 'medications' && (
          <PatientMedicationsAllergiesTab patient={patient} onRefresh={fetchPatientDetail} />
        )}

        {activeTab === 'documents' && (
          <PatientDocumentsTab
            patient={patient}
            onRefresh={fetchPatientDetail}
            openUploadModal={docModalOpen}
          />
        )}

        {activeTab === 'images' && (
          <PatientImagesTab
            patient={patient}
            onRefresh={fetchPatientDetail}
            openUploadModal={imgModalOpen}
          />
        )}

        {activeTab === 'consultations' && (
          <PatientConsultationsTab
            patient={patient}
            onStartNewConsultation={() => navigate('/consultations')}
          />
        )}

        {activeTab === 'timeline' && <PatientTimelineTab patient={patient} />}
      </div>

      {/* Edit Demographic Profile Modal */}
      <EditPatientModal
        patient={patient}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={fetchPatientDetail}
      />

      {/* Request Tele-Doctor Modal */}
      {showDoctorReqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-md bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" /> Request Remote Specialist
              </h3>
              <button onClick={() => setShowDoctorReqModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDoctorRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialty Required</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  value={doctorSpecialty}
                  onChange={(e) => setDoctorSpecialty(e.target.value)}
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pulmonology">Pulmonology / Respiratory Care</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Pediatrics">Pediatrics</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  value={doctorPriority}
                  onChange={(e) => setDoctorPriority(e.target.value as any)}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent Escalation</option>
                  <option value="emergency">Emergency Priority</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Escalation Notes / Clinical Context</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Uncontrolled blood pressure despite Amlodipine regimen. Seeking medication dose adjustment."
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowDoctorReqModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmittingDoctorReq}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Patient Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePatientConfirm}
        title="Delete Patient Record"
        description={`Are you sure you want to permanently delete patient ${patient.name} (${patient.id}) from the local offline database? This action cannot be undone.`}
        confirmText="Delete Patient"
      />
    </div>
  );
};
