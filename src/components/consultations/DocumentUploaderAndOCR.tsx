import React, { useState, useRef } from 'react';
import { documentService, OcrExtractionResult } from '../../services/documentService';
import { MedicalDocument } from '../../types';
import { FilePlus, UploadCloud, FileText, CheckCircle2, AlertTriangle, RefreshCw, X, Eye, Edit3, Sparkles, Tag } from 'lucide-react';
import { Button } from '../ui/Button';

interface DocumentUploaderAndOCRProps {
  documents: MedicalDocument[];
  onChangeDocuments: (docs: MedicalDocument[]) => void;
  onConfirmOcrData: (extractedData: {
    documentId: string;
    text: string;
    structuredData: OcrExtractionResult['structuredData'];
  }) => void;
}

export const DocumentUploaderAndOCR: React.FC<DocumentUploaderAndOCRProps> = ({
  documents,
  onChangeDocuments,
  onConfirmOcrData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('prescription');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Active document undergoing OCR review
  const [activeOcrDoc, setActiveOcrDoc] = useState<MedicalDocument | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate file
    const validation = documentService.validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      // Create new mock MedicalDocument
      const newDoc: MedicalDocument = {
        id: `doc-${Date.now()}`,
        patientId: 'PAT-CURRENT',
        title: file.name,
        category: selectedCategory as any,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toLocaleDateString(),
        notes: `Uploaded file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
        ocrExtractedText: '',
      };

      const updatedDocs = [...documents, newDoc];
      onChangeDocuments(updatedDocs);

      // Automatically trigger OCR for this new document
      await triggerOcrForDoc(newDoc, file);
    } catch (err: any) {
      setUploadError('Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerOcrForDoc = async (doc: MedicalDocument, rawFile?: File) => {
    setActiveOcrDoc(doc);
    setIsOcrProcessing(true);
    setOcrResult(null);

    try {
      // Mock File if re-running
      const dummyFile = rawFile || new File(['mock content'], doc.title, { type: 'application/pdf' });
      const result = await documentService.processOCR(dummyFile, doc.category);
      setOcrResult(result);
      setEditedText(result.extractedText);
    } catch (err: any) {
      setUploadError(err.message || 'OCR extraction failed.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleConfirmOcr = () => {
    if (!activeOcrDoc || !ocrResult) return;

    // Update document with confirmed OCR text
    const updated = documents.map((d) => (d.id === activeOcrDoc.id ? { ...d, ocrExtractedText: editedText } : d));
    onChangeDocuments(updated);

    onConfirmOcrData({
      documentId: activeOcrDoc.id,
      text: editedText,
      structuredData: ocrResult.structuredData,
    });

    setActiveOcrDoc(null);
    setOcrResult(null);
  };

  const handleRemoveDoc = (id: string) => {
    onChangeDocuments(documents.filter((d) => d.id !== id));
    if (activeOcrDoc?.id === id) {
      setActiveOcrDoc(null);
      setOcrResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-teal-600" />
            Medical Document Upload & Optical Character Recognition (OCR)
          </h3>
          <p className="text-xs text-slate-500">
            Upload paper prescriptions, lab reports, or discharge sheets to extract medical data automatically.
          </p>
        </div>

        {/* Category selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
        >
          <option value="prescription">Prescription / Rx Sheet</option>
          <option value="lab_report">Lab Diagnostic Report</option>
          <option value="vitals_sheet">Vitals / PHC Intake Log</option>
          <option value="discharge_summary">Discharge Summary</option>
        </select>
      </div>

      {/* Drag and Drop File Upload Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/50 hover:bg-teal-50/20 p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <span className="font-bold text-sm text-slate-800 block">Click or Drag & Drop Document Here</span>
          <span className="text-xs text-slate-500">Supports PDF, JPG, PNG, WEBP (Max 10MB)</span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Uploaded Documents ({documents.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                    <FileText className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{doc.title}</span>
                    <span className="text-[11px] text-slate-500 capitalize">{doc.category.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => triggerOcrForDoc(doc)}>
                    OCR Extracted
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OCR Processing & Review Modal / Banner */}
      {activeOcrDoc && (
        <div className="p-5 rounded-2xl border border-teal-300 bg-teal-50/40 space-y-4">
          <div className="flex items-center justify-between border-b border-teal-200 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-slate-900 text-sm">
                OCR Extracted Data Review for: &quot;{activeOcrDoc.title}&quot;
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
              OCR Extracted
            </span>
          </div>

          {isOcrProcessing ? (
            <div className="p-6 text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <span className="font-bold text-sm text-slate-800 block">Processing Document OCR...</span>
              <span className="text-xs text-slate-500">Extracting structured clinical findings and lab values</span>
            </div>
          ) : ocrResult ? (
            <div className="space-y-4">
              {/* Structured Extracted Data Badges */}
              {ocrResult.structuredData && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block text-xs uppercase">Structured Extracted Entities:</span>

                  {ocrResult.structuredData.vitalsFound && (
                    <div className="flex items-center gap-2 text-teal-800 font-semibold bg-teal-50 p-2 rounded">
                      <Tag className="w-3.5 h-3.5 text-teal-600" />
                      <span>Vitals Found: </span>
                      {Object.entries(ocrResult.structuredData.vitalsFound).map(([k, v]) => (
                        <span key={k} className="bg-white px-2 py-0.5 rounded border border-teal-200">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}

                  {ocrResult.structuredData.medicationsFound && (
                    <div className="space-y-1">
                      <span className="text-slate-600 font-semibold">Prescriptions Found:</span>
                      <div className="flex flex-wrap gap-2">
                        {ocrResult.structuredData.medicationsFound.map((m, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-1 rounded text-xs font-semibold"
                          >
                            {m.name} ({m.dosage}) - {m.frequency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {ocrResult.structuredData.labResultsFound && (
                    <div className="space-y-1">
                      <span className="text-slate-600 font-semibold">Lab Values Found:</span>
                      <div className="flex flex-wrap gap-2">
                        {ocrResult.structuredData.labResultsFound.map((l, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-50 text-purple-900 border border-purple-200 px-2 py-1 rounded text-xs"
                          >
                            <strong>{l.testName}:</strong> {l.value} (Normal: {l.normalRange})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw Extracted Text Editor */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                  Full OCR Raw Text (Editable):
                </label>
                <textarea
                  rows={4}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveOcrDoc(null)}>
                  Discard Preview
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmOcr}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Confirm & Append OCR Data to Intake
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
