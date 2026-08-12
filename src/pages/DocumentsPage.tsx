import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SourceBadge } from '../components/common/SourceBadge';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { useNotification } from '../context/NotificationContext';
import { FileText, Upload, Sparkles, CheckCircle2, Scan, Eye, FileSpreadsheet, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<OCRDoc | null>(null);

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

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    addToast({
      title: 'Scanning Medical Document',
      message: `Running OCR parser on ${file.name}...`,
      type: 'info',
    });

    setTimeout(() => {
      const newDoc: OCRDoc = {
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        name: file.name,
        patientName: 'Priya Sharma',
        type: 'Scanned Clinical Report',
        uploadedAt: 'Just now',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: 'completed',
        entities: ['Extracted HbA1c: 6.9%', 'Extracted Blood Pressure: 130/85 mmHg', 'AI Confidence: 98.4%'],
      };

      setDocs([newDoc, ...docs]);
      setIsUploading(false);
      setSelectedDoc(newDoc);

      addToast({
        title: 'OCR Extraction Successful',
        message: 'Entities extracted and linked with patient intake file.',
        type: 'success',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              OCR Document Intelligence
            </span>
            <span className="text-xs text-slate-500">• Auto-Extraction</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Medical Document Repository & OCR Scan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload paper prescriptions, lab pathology reports, or discharge summaries to automatically extract vital signs and medications.
          </p>
        </div>

        <label className="cursor-pointer shrink-0">
          <input type="file" accept="image/*,.pdf" onChange={handleSimulateUpload} className="hidden" />
          <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition-all">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Extracting Text...' : 'Scan / Upload Document'}
          </span>
        </label>
      </div>

      <HealthcareSafetyNotice compact />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Dropzone Container */}
          <div className="border-2 border-dashed border-teal-200 bg-teal-50/40 hover:bg-teal-50 rounded-2xl p-6 text-center space-y-2 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Drag & Drop Medical Document or Photo</p>
              <p className="text-xs text-slate-500 mt-0.5">Supports PDF, JPG, PNG up to 15MB • Low-bandwidth optimized compression</p>
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
              <CardTitle className="flex items-center justify-between">
                <span>Processed Documents Repository</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {docs.length} Documents
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    selectedDoc?.id === doc.id
                      ? 'border-teal-500 bg-teal-50/60 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{doc.name}</p>
                        <SourceBadge source="OCR Extracted" />
                      </div>
                      <p className="text-xs text-slate-600">
                        Patient: <strong>{doc.patientName}</strong> • {doc.type}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {doc.uploadedAt} • {doc.size}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Badge variant="success" showDot>
                      OCR Complete
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-teal-700 hover:text-teal-900 text-xs font-semibold">
                      Inspect →
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Inspection Column */}
        <div className="lg:col-span-5">
          {selectedDoc ? (
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
          )}
        </div>
      </div>
    </div>
  );
};
