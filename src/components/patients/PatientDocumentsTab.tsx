import React, { useState } from 'react';
import { Patient, MedicalDocument } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmationDialog } from './ConfirmationDialog';
import {
  FileText,
  FilePlus,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Download,
  Sparkles,
} from 'lucide-react';

interface PatientDocumentsTabProps {
  patient: Patient;
  onRefresh: () => void;
  openUploadModal?: boolean;
}

export const PatientDocumentsTab: React.FC<PatientDocumentsTabProps> = ({
  patient,
  onRefresh,
  openUploadModal = false,
}) => {
  const { addToast } = useNotification();
  const [showUploadModal, setShowUploadModal] = useState(openUploadModal);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<MedicalDocument | null>(null);

  // Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'prescription' | 'lab_report' | 'vitals_sheet' | 'discharge_summary'>('prescription');
  const [docNotes, setDocNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      addToast({ title: 'Validation Error', message: 'Document title is required.', type: 'warning' });
      return;
    }

    setIsUploading(true);
    try {
      await patientService.addDocument(patient.id, {
        title: docTitle,
        category: docCategory,
        notes: docNotes,
        fileSize: '1.2 MB',
        ocrSummary: 'Extracted parameters: Fasting blood sugar 132 mg/dL. Prescribed Amlodipine 5mg OD.',
      });

      addToast({
        title: 'Document Uploaded',
        message: 'Report scanned and processed with mock OCR pipeline.',
        type: 'success',
      });

      setDocTitle('');
      setDocNotes('');
      setShowUploadModal(false);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to upload document.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;
    try {
      await patientService.deleteDocument(patient.id, docToDelete.id);
      addToast({
        title: 'Document Deleted',
        message: `Removed ${docToDelete.title} from patient record.`,
        type: 'info',
      });
      setDocToDelete(null);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete document.', type: 'error' });
    }
  };

  const documents = patient.documents || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Uploaded Medical Documents & Reports
          </h3>
          <p className="text-xs text-slate-500">
            Scanned prescriptions, laboratory test sheets, and discharge notes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<FilePlus className="w-4 h-4" />}
          onClick={() => setShowUploadModal(true)}
        >
          Upload Report
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} variant="flat" className="p-4 bg-white border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0 border border-teal-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="neutral">{doc.category.replace('_', ' ')}</Badge>
                      <span className="text-[11px] text-slate-400">{doc.fileSize}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Uploaded: {doc.uploadedAt}</p>
                  </div>
                </div>

                <Badge variant={doc.ocrStatus === 'completed' ? 'success' : 'warning'}>
                  OCR {doc.ocrStatus}
                </Badge>
              </div>

              {doc.ocrSummary && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="text-[10px] font-bold text-teal-800 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" /> Mock OCR Extraction Summary
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{doc.ocrSummary}</p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedDoc(doc)}
                >
                  Preview
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => setDocToDelete(doc)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="flat" className="p-8 text-center bg-slate-50 border-dashed border-slate-200">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Documents Uploaded</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Upload paper prescriptions or laboratory reports to scan and archive them for remote doctors.
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Document
          </Button>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-md bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Upload Medical Report</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <Input
                  placeholder="e.g. PHC Prescription Sheet or Blood Test"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                >
                  <option value="prescription">Prescription Sheet</option>
                  <option value="lab_report">Lab Test Report</option>
                  <option value="vitals_sheet">Vitals / Nursing Sheet</option>
                  <option value="discharge_summary">Discharge Summary</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Scanned during home visit by ASHA worker."
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-md text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-teal-700">Mock File Selection</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF, JPG, PNG up to 10MB</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isUploading}>
                  Process & Upload
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-lg bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-500">{selectedDoc.category} • {selectedDoc.uploadedAt}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-64 flex items-center justify-center">
              <img
                src={selectedDoc.fileUrl}
                alt={selectedDoc.title}
                className="w-full h-full object-cover"
              />
            </div>

            {selectedDoc.ocrSummary && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-md text-xs text-teal-900">
                <strong>Extracted Text:</strong> {selectedDoc.ocrSummary}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                Close Preview
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        description={`Are you sure you want to delete "${docToDelete?.title}"? This action removes the document from the patient's mock record.`}
        confirmText="Delete Document"
      />
    </div>
  );
};
