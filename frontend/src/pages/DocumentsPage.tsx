import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SourceBadge } from '../components/common/SourceBadge';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';
import { PatientDocumentSummaryResult } from '../types/document';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Scan,
  FileSpreadsheet,
  AlertCircle,
  Pill,
  ShieldAlert,
  CalendarCheck,
  CheckSquare,
  Activity,
  Heart,
  Info,
} from 'lucide-react';

interface OCRDoc {
  id: string;
  name: string;
  patientName: string;
  type: string;
  uploadedAt: string;
  size: string;
  status: 'completed' | 'processing' | 'failed';
  entities: string[];
}

export const DocumentsPage: React.FC = () => {
  const { addToast } = useNotification();
  const { role, user } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<OCRDoc | null>(null);
  const [patientSummary, setPatientSummary] = useState<PatientDocumentSummaryResult | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);

  const [docs, setDocs] = useState<OCRDoc[]>([
    {
      id: 'DOC-1001',
      name: 'Lab_Report_HbA1c_Glucose.pdf',
      patientName: 'Ramesh Patel',
      type: 'Laboratory Pathology Report',
      uploadedAt: 'Today, 09:15 AM',
      size: '1.4 MB',
      status: 'completed',
      entities: ['HbA1c: 7.8% (Elevated)', 'Fast Glucose: 182 mg/dL', 'Serum Creatinine: 1.1 mg/dL', 'Platelets: 240,000 /mcL'],
    },
    {
      id: 'DOC-1002',
      name: 'Discharge_Summary_Rampur_PHC.jpg',
      patientName: 'Sunita Devi',
      type: 'Hospital Discharge Summary',
      uploadedAt: 'Yesterday, 04:30 PM',
      size: '2.8 MB',
      status: 'completed',
      entities: ['Diagnosis: Acute Respiratory Infection', 'Prescription: Amoxicillin 500mg TID (5 days)', 'Vitals on exit: SpO2 97%, BP 122/80'],
    },
    {
      id: 'DOC-1003',
      name: 'Previous_Rx_Amlodipine_2025.png',
      patientName: 'Anil Kumar',
      type: 'Handwritten Doctor Prescription',
      uploadedAt: '10 Aug 2026',
      size: '890 KB',
      status: 'completed',
      entities: ['Rx: Amlodipine 5mg OD', 'Rx: Metformin 500mg BID', 'Advice: Low salt diet & BP check in 14 days'],
    },
  ]);

  // Remove auto-selection on page load so summary ONLY displays when patient explicitly selects or scans a document

  const handleSelectDocument = async (doc: OCRDoc) => {
    setSelectedDoc(doc);
    if (role === 'PATIENT') {
      setIsLoadingSummary(true);
      try {
        const res = await documentService.getPatientDocumentSummary({
          document_id: doc.id,
          document_type: doc.type,
        });
        setPatientSummary(res);
      } catch (err) {
        console.error('Failed to load patient summary', err);
      } finally {
        setIsLoadingSummary(false);
      }
    }
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    addToast({
      title: 'Scanning Medical Document',
      message: `Running OCR parser & Gemini AI explainer on ${file.name}...`,
      type: 'info',
    });

    setTimeout(async () => {
      const newDoc: OCRDoc = {
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        name: file.name,
        patientName: user?.name || 'Ramesh Patel',
        type: 'Scanned Medical Prescription',
        uploadedAt: 'Just now',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'completed',
        entities: ['Extracted Prescribed Medicines: 2', 'AI Confidence: 98.6%'],
      };

      setDocs((prev) => [newDoc, ...prev]);
      setIsUploading(false);
      await handleSelectDocument(newDoc);

      addToast({
        title: 'OCR & Gemini AI Summary Ready',
        message: 'Patient-friendly medication instructions and precautions generated.',
        type: 'success',
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
              {role === 'PATIENT' ? 'My Health Records & AI Explainer' : 'OCR Document Intelligence'}
            </span>
            <span className="text-xs text-slate-500">• Gemini AI Analysis</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {role === 'PATIENT' ? 'Medical Record OCR & AI Prescription Guide' : 'Medical Document Repository & OCR Scan'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {role === 'PATIENT'
              ? 'Upload your prescriptions, lab test reports, or hospital summaries to get a clear, patient-friendly AI summary with medication steps and precautions.'
              : 'Upload paper prescriptions, lab pathology reports, or discharge summaries to automatically extract vital signs and medications.'}
          </p>
        </div>

        <label className="cursor-pointer shrink-0">
          <input type="file" accept="image/*,.pdf" onChange={handleSimulateUpload} className="hidden" />
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition-all">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Extracting & Analyzing...' : 'Scan / Upload Document'}
          </span>
        </label>
      </div>

      <HealthcareSafetyNotice compact />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Dropzone Container */}
          <div className="border-2 border-dashed border-teal-200 bg-teal-50/40 hover:bg-teal-50 rounded-2xl p-5 text-center space-y-2 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Drag & Drop Medical Document or Photo</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF, JPG, PNG up to 15MB • Low-bandwidth optimized</p>
            </div>
            <label className="inline-block cursor-pointer pt-1">
              <input type="file" accept="image/*,.pdf" onChange={handleSimulateUpload} className="hidden" />
              <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50">
                Browse Files
              </span>
            </label>
          </div>

          {/* Documents Table / Card List */}
          <Card variant="default">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{role === 'PATIENT' ? 'My Medical Documents' : 'Processed Documents Repository'}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {docs.length} Documents
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedDoc?.id === doc.id
                      ? 'border-teal-500 bg-teal-50/60 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{doc.name}</p>
                        <SourceBadge source="OCR Analyzed" />
                      </div>
                      <p className="text-xs text-slate-600 truncate">{doc.type}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.uploadedAt} • {doc.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Badge variant="success" showDot>
                      Ready
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dedicated Patient AI Summary vs Standard OCR Extraction */}
        <div className="lg:col-span-6">
          {role === 'PATIENT' ? (
            /* PATIENT ROLE: Dedicated Gemini AI Summary Card (Shows ONLY when a document is scanned/selected) */
            selectedDoc && patientSummary ? (
              <Card variant="default" className="border-teal-300 shadow-md">
                <CardHeader className="bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-t-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <CardTitle className="text-base text-white font-bold">
                        Gemini AI Patient Report & Medication Guide
                      </CardTitle>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-200 border border-teal-700">
                      {selectedDoc.id}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-teal-100 mt-1">
                    Easy plain-language medical summary, simple dosage steps, and safety precautions.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4 text-xs">
                  {/* Simple Plain Language Summary */}
                  <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 space-y-1">
                    <h4 className="font-extrabold text-teal-950 text-xs flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-teal-700" /> What This Medical Report Means For You
                    </h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {patientSummary.patient_friendly_summary}
                    </p>
                  </div>

                  {/* Key Findings in Simple Terms */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-600" /> Key Health Observations (Simple Terms)
                    </h4>
                    <div className="space-y-1.5">
                      {patientSummary.important_findings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 font-semibold flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detected Medications */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-emerald-600" /> Detected Prescribed Medicines
                    </h4>
                    <div className="space-y-2">
                      {patientSummary.detected_medications.map((med, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-emerald-900">{med.name}</span>
                            {med.duration && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {med.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-700">{med.dosage}</p>
                          {med.purpose && <p className="text-[11px] text-slate-500 italic">Purpose: {med.purpose}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Easy Medication Steps to Take */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-teal-600" /> Daily Medication Intake Steps
                    </h4>
                    <div className="space-y-2">
                      {patientSummary.medication_steps_to_take.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5 shadow-2xs">
                          <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precautions & Warnings */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" /> Important Health Precautions
                    </h4>
                    <div className="space-y-1.5">
                      {patientSummary.precautions.map((precaution, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-950 font-medium text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{precaution}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Next Steps */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-amber-600" /> Recommended Follow-Up Steps
                    </h4>
                    <div className="space-y-1.5">
                      {patientSummary.recommended_next_steps.map((nextStep, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-semibold text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>{nextStep}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isLoadingSummary ? (
              <div className="p-8 border border-dashed border-teal-300 rounded-2xl bg-white text-center space-y-2 text-slate-500 text-xs shadow-2xs">
                <Sparkles className="w-8 h-8 text-teal-600 mx-auto animate-spin" />
                <p className="font-bold text-slate-800">Generating Simple Gemini AI Summary...</p>
                <p>Translating medical report into clear plain language and step-by-step medication guidance.</p>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-white text-center space-y-3 text-slate-500 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Select or Scan a Document</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click on any prescription or medical report from the list on the left (or upload a new scan) to view your easy-to-understand Gemini AI Summary.
                  </p>
                </div>
              </div>
            )
          ) : (
            /* STANDARD ROLE: Health Worker / Doctor / Admin View */
            selectedDoc ? (
              <Card variant="default" className="sticky top-20 border-teal-200">
                <CardHeader className="bg-slate-50 border-b border-slate-200/80 rounded-t-xl pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <CardTitle className="text-sm">OCR Extracted Entities</CardTitle>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border text-slate-600">
                      {selectedDoc.id}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Automated textual data extracted from {selectedDoc.name}.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Linked Patient Record</span>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedDoc.patientName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Document Category</span>
                    <p className="text-slate-700 font-semibold mt-0.5">{selectedDoc.type}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">
                      Extracted Medical Observations
                    </span>
                    <div className="space-y-2">
                      {selectedDoc.entities.map((entity, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 font-medium flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <span>{entity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Human Validation Disclaimer
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      OCR data has been automatically appended to the patient&apos;s intake record for AI evaluation. Always cross-verify numerical values with original hardcopy files.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold"
                    onClick={() => addToast({ title: 'Record Linked', message: 'OCR data verified for patient.', type: 'success' })}
                  >
                    Verify & Attach to Patient File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-white text-center space-y-2 text-slate-500 text-xs">
                <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700">Select a Document to View Extracted OCR Data</p>
                <p>Click on any document in the repository list to preview parsed laboratory values and prescriptions.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
