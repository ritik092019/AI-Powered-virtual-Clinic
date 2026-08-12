import React, { useState } from 'react';
import { Patient, PatientImage } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { patientService } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ImagePlus, Eye, Trash2, Camera, X, Upload, Sparkles } from 'lucide-react';

interface PatientImagesTabProps {
  patient: Patient;
  onRefresh: () => void;
  openUploadModal?: boolean;
}

export const PatientImagesTab: React.FC<PatientImagesTabProps> = ({
  patient,
  onRefresh,
  openUploadModal = false,
}) => {
  const { addToast } = useNotification();
  const [showUploadModal, setShowUploadModal] = useState(openUploadModal);
  const [selectedImg, setSelectedImg] = useState<PatientImage | null>(null);
  const [imgToDelete, setImgToDelete] = useState<PatientImage | null>(null);

  // Form State
  const [imgTitle, setImgTitle] = useState('');
  const [bodyPart, setBodyPart] = useState('Dermatology / Lesion');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgTitle.trim()) {
      addToast({ title: 'Validation Error', message: 'Image title is required.', type: 'warning' });
      return;
    }

    setIsUploading(true);
    try {
      await patientService.addImage(patient.id, {
        title: imgTitle,
        bodyPart,
        notes,
        status: 'processed',
      });

      addToast({
        title: 'Clinical Photo Uploaded',
        message: 'Image attached to patient chart with mock processing tag.',
        type: 'success',
      });

      setImgTitle('');
      setNotes('');
      setShowUploadModal(false);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to upload image.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!imgToDelete) return;
    try {
      await patientService.deleteImage(patient.id, imgToDelete.id);
      addToast({
        title: 'Image Deleted',
        message: `Removed ${imgToDelete.title} from clinical records.`,
        type: 'info',
      });
      setImgToDelete(null);
      onRefresh();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete image.', type: 'error' });
    }
  };

  const images = patient.images || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-600" /> Clinical Images & Dermatological Photos
          </h3>
          <p className="text-xs text-slate-500">
            High-resolution photos of skin lesions, eye scans, or wound progress.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<ImagePlus className="w-4 h-4" />}
          onClick={() => setShowUploadModal(true)}
        >
          Capture / Upload Photo
        </Button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <Card
              key={img.id}
              variant="flat"
              className="overflow-hidden bg-white border border-slate-200 group hover:border-teal-300 transition-all"
            >
              <div
                className="h-44 bg-slate-100 overflow-hidden relative cursor-pointer"
                onClick={() => setSelectedImg(img)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="success">Mock Analysis Ready</Badge>
                </div>
              </div>

              <div className="p-3">
                <h4 className="font-bold text-slate-900 text-sm truncate">{img.title}</h4>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>Part: {img.bodyPart || 'General'}</span>
                  <span>{img.capturedAt}</span>
                </div>

                {img.notes && (
                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 italic bg-slate-50 p-1.5 rounded">
                    "{img.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedImg(img)}
                  >
                    Zoom View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:bg-rose-50"
                    onClick={() => setImgToDelete(img)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="flat" className="p-8 text-center bg-slate-50 border-dashed border-slate-200">
          <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Clinical Photos</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Capture or upload images of skin lesions, throat redness, or swelling for tele-doctor inspection.
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ImagePlus className="w-4 h-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Clinical Image
          </Button>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-md bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Upload Clinical Photo</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Image Title *</label>
                <Input
                  placeholder="e.g. Skin Rash Right Forearm"
                  value={imgTitle}
                  onChange={(e) => setImgTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anatomical Location</label>
                <select
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-xs"
                  value={bodyPart}
                  onChange={(e) => setBodyPart(e.target.value)}
                >
                  <option value="Dermatology / Lesion">Dermatology / Lesion</option>
                  <option value="Ophthalmology / Eye">Ophthalmology / Eye</option>
                  <option value="Oral / Throat">Oral / Throat</option>
                  <option value="Extremity / Joint">Extremity / Joint</option>
                  <option value="Wound / Injury">Wound / Injury</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Observation Context</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient reports itching and mild scaling for 3 days."
                  className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-md text-center">
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-teal-700">Mock Camera Capture</span>
                <p className="text-[10px] text-slate-400 mt-0.5">High contrast lighting recommended</p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isUploading}>
                  Upload Photo
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <Card variant="flat" className="w-full max-w-lg bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedImg.title}</h3>
                <p className="text-xs text-slate-500">{selectedImg.bodyPart} • {selectedImg.capturedAt}</p>
              </div>
              <button onClick={() => setSelectedImg(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-80 flex items-center justify-center">
              <img
                src={selectedImg.imageUrl}
                alt={selectedImg.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {selectedImg.notes && (
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                <strong>Observations:</strong> {selectedImg.notes}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedImg(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={Boolean(imgToDelete)}
        onClose={() => setImgToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Clinical Image"
        description={`Are you sure you want to delete "${imgToDelete?.title}"? This photo will be removed from the patient record.`}
        confirmText="Delete Image"
      />
    </div>
  );
};
