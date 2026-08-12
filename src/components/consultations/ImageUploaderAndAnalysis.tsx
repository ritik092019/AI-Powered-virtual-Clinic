import React, { useState, useRef } from 'react';
import { PatientImage } from '../../types';
import { Camera, Upload, Eye, X, ShieldAlert, Sparkles, AlertTriangle, RefreshCw, CheckCircle2, Tag } from 'lucide-react';
import { Button } from '../ui/Button';

interface ImageObservation {
  imageId: string;
  title: string;
  bodyPart: string;
  observationSummary: string;
  disclaimer: string;
}

interface ImageUploaderAndAnalysisProps {
  images: PatientImage[];
  onChangeImages: (images: PatientImage[]) => void;
  imageObservations: ImageObservation[];
  onChangeImageObservations: (obs: ImageObservation[]) => void;
}

const BODY_PARTS = [
  'Skin / Rash (त्वचा)',
  'Throat / Mouth (गला)',
  'Eye / Conjunctiva (आँख)',
  'Limb / Injury (हाथ/पैर चोट)',
  'Chest / Abdomen (छाती/पेट)',
  'Other / General',
];

export const ImageUploaderAndAnalysis: React.FC<ImageUploaderAndAnalysisProps> = ({
  images,
  onChangeImages,
  imageObservations,
  onChangeImageObservations,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>(BODY_PARTS[0]);
  const [clinicalNote, setClinicalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const localUrl = URL.createObjectURL(file);
    const newImgId = `img-${Date.now()}`;

    const newImage: PatientImage = {
      id: newImgId,
      patientId: 'PAT-CURRENT',
      title: `${selectedBodyPart} Photo`,
      bodyPart: selectedBodyPart,
      imageUrl: localUrl,
      capturedAt: new Date().toLocaleDateString(),
      notes: clinicalNote || 'Captured by health worker during consultation',
    };

    const updatedImages = [...images, newImage];
    onChangeImages(updatedImages);
    setClinicalNote('');

    // Trigger mock AI image analysis
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock supportive observation
    const newObs: ImageObservation = {
      imageId: newImgId,
      title: `${selectedBodyPart} Image Assessment`,
      bodyPart: selectedBodyPart,
      observationSummary: `Slight erythema and localized skin elevation observed. No visible necrosis or active purulent exudate. Supportive visual finding for local inflammatory response.`,
      disclaimer: `Supportive observation only. Must be reviewed and verified by a certified medical practitioner.`,
    };

    onChangeImageObservations([...imageObservations, newObs]);
    setIsProcessing(false);
  };

  const handleRemoveImage = (id: string) => {
    onChangeImages(images.filter((img) => img.id !== id));
    onChangeImageObservations(imageObservations.filter((obs) => obs.imageId !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-600" />
            Clinical Photo Capture & Supportive Image Analysis
          </h3>
          <p className="text-xs text-slate-500">Capture photos of rashes, throat redness, or injuries for doctor review.</p>
        </div>
      </div>

      {/* Limitation / Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm">Medical AI Image Safety Notice:</span>
          <span>
            Supportive visual feature detection only. Computer vision findings are NOT a definitive diagnosis and must be
            reviewed by a licensed medical practitioner.
          </span>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
        <span className="font-bold text-slate-800 text-sm block">Capture / Upload Clinical Photo</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Anatomical Body Part / Location</label>
            <select
              value={selectedBodyPart}
              onChange={(e) => setSelectedBodyPart(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
            >
              {BODY_PARTS.map((bp) => (
                <option key={bp} value={bp}>
                  {bp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observation Note</label>
            <input
              type="text"
              placeholder="e.g. Itchy rash on inner arm for 2 days..."
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />

        <Button
          variant="primary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          leftIcon={<Upload className="w-4 h-4" />}
          isLoading={isProcessing}
        >
          Upload Photo & Run Image Analysis
        </Button>
      </div>

      {/* Processing Spinner */}
      {isProcessing && (
        <div className="p-6 text-center space-y-2 border border-teal-200 rounded-xl bg-teal-50/50">
          <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <span className="font-bold text-sm text-slate-800 block">Analyzing Clinical Image...</span>
          <span className="text-xs text-slate-500">Checking anatomical features and lesion characteristics</span>
        </div>
      )}

      {/* Captured Image Gallery & AI Image Observation */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Attached Clinical Images ({images.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img) => {
              const obs = imageObservations.find((o) => o.imageId === img.id);

              return (
                <div key={img.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs shadow-2xs">
                  <div className="flex gap-3">
                    <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200 group">
                      <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(img.imageUrl)}
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm truncate">{img.title}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        Tag: {img.bodyPart}
                      </span>
                      <p className="text-slate-600 italic line-clamp-2">{img.notes}</p>
                    </div>
                  </div>

                  {/* AI Image Observation Card */}
                  {obs && (
                    <div className="p-3 rounded-lg border border-teal-200 bg-teal-50/50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-teal-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                          AI Image Observation
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-teal-800 border border-teal-200">
                          Supportive
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed">{obs.observationSummary}</p>

                      <div className="text-[10px] text-amber-900 font-medium bg-amber-50 p-1.5 rounded border border-amber-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{obs.disclaimer}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4"
        >
          <div className="max-w-2xl max-h-[90vh] bg-white p-2 rounded-xl overflow-hidden relative">
            <img src={previewModalUrl} alt="Clinical Zoom" className="max-h-[80vh] w-auto mx-auto rounded-lg" />
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
