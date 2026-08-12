import React, { useState, useRef } from 'react';
import { Camera, Upload, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface CameraCaptureProps {
  onImageCaptured: (base64Image: string | undefined) => void;
}

export const EmergencyCameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera stream access failed, falling back to file input:', err);
      fileInputRef.current?.click();
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(base64);
      onImageCaptured(base64);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      onImageCaptured(base64);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    onImageCaptured(undefined);
    stopCamera();
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
        <span>Patient / Medical Condition Photo</span>
        <span className="text-[10px] text-slate-400 font-normal">Direct Camera or Upload</span>
      </label>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {imagePreview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-slate-900 group">
          <img src={imagePreview} alt="Captured emergency condition" className="w-full h-48 object-cover" />
          <div className="absolute top-2 right-2 flex items-center space-x-2">
            <button
              onClick={clearImage}
              type="button"
              className="p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
              title="Remove / Retake"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-emerald-950/90 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-600/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Photo Attached for Gemini AI Analysis
          </div>
        </div>
      ) : isCameraActive ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-indigo-500 bg-black flex flex-col items-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
          <div className="absolute bottom-3 flex items-center space-x-3">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={capturePhoto}
              leftIcon={<Camera className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg"
            >
              Snap Photo Now
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={stopCamera} className="bg-slate-900/80 text-white border-slate-700">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={startCamera}
            className="p-4 rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50 text-rose-800 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold group"
          >
            <div className="p-2.5 bg-rose-600 text-white rounded-full group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span>Capture with Camera</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-800 flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold group"
          >
            <div className="p-2.5 bg-indigo-600 text-white rounded-full group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span>Upload Photo File</span>
          </button>
        </div>
      )}
    </div>
  );
};
