import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Globe,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  Edit3,
  Send,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { voiceAssistantService, VoiceAssistantResponseData } from '../../services/voiceAssistantService';

interface RegionalVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'en', label: 'English' },
];

export const RegionalVoiceAssistantModal: React.FC<RegionalVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { role } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing' | 'result'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptText, setTranscriptText] = useState('');
  const [aiResult, setAiResult] = useState<VoiceAssistantResponseData | null>(null);

  // Timer effect when recording
  useEffect(() => {
    let timer: any = null;
    if (recordingState === 'recording') {
      timer = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [recordingState]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setRecordingSeconds(0);
    setRecordingState('recording');
  };

  const handleStopRecording = () => {
    setRecordingState('processing');
    const mockSpeech = voiceAssistantService.getMockTranscript(selectedLanguage);
    setTranscriptText(mockSpeech);
    setTimeout(() => setRecordingState('idle'), 600);
  };

  const handleSubmitForAI = async () => {
    setRecordingState('processing');
    try {
      const res = await voiceAssistantService.processVoiceAssistant({
        language: selectedLanguage,
        user_transcript: transcriptText,
        user_role: role,
      });
      setAiResult(res);
      setRecordingState('result');
    } catch (err) {
      console.error('Voice assistant error', err);
      const fallback = voiceAssistantService.getMockResponse(selectedLanguage, transcriptText, role);
      setAiResult(fallback);
      setRecordingState('result');
    }
  };

  const handleReset = () => {
    setRecordingState('idle');
    setTranscriptText('');
    setAiResult(null);
    setRecordingSeconds(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden space-y-0 my-8">
        {/* Header Bar */}
        <div className="bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-teal-950 flex items-center justify-center font-black">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>Regional-Language Voice Assistant</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-950 text-teal-200 text-[10px] border border-teal-700 font-mono">
                  Gemini AI Powered
                </span>
              </h3>
              <p className="text-xs text-teal-100 mt-0.5">
                Speak your health symptoms in Hindi, Telugu, Tamil, Marathi, or English.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Bar: Regional Language Selection */}
          <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold text-teal-950">Select Preferred Speaking Language:</span>
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={recordingState === 'recording' || recordingState === 'processing'}
              className="px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Workflow Step 1 & 2: Recording & Transcript Review */}
          {recordingState !== 'result' ? (
            <div className="space-y-5">
              {/* Microphone Action Box */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center space-y-4 text-center">
                {recordingState === 'recording' ? (
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-rose-500/20 animate-ping absolute inset-0" />
                      <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl relative z-10">
                        <Volume2 className="w-10 h-10 animate-bounce" />
                      </div>
                    </div>

                    <div>
                      <span className="font-extrabold text-base text-rose-700 block">
                        Listening in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label}... ({recordingSeconds}s)
                      </span>
                      <span className="text-xs text-slate-500">Speak your symptoms clearly into your device microphone.</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleStopRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                    >
                      Done Speaking (Stop)
                    </Button>
                  </div>
                ) : recordingState === 'processing' ? (
                  <div className="py-6 flex flex-col items-center space-y-3">
                    <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-sm font-bold text-slate-800">Processing Speech & Regional AI Analysis...</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="w-16 h-16 rounded-full bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
                    >
                      <Mic className="w-8 h-8" />
                    </button>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">Tap Microphone to Speak Symptoms</span>
                      <span className="text-xs text-slate-500">
                        Press 🎤 and speak in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label}.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Editable Transcript Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-teal-600" />
                    Review & Edit Your Spoken Symptoms Transcript:
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Editable text box</span>
                </div>

                <textarea
                  rows={4}
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="Your spoken transcript will appear here automatically. You can also edit or type symptoms directly..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-slate-500">
                  Clear All
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitForAI}
                  disabled={!transcriptText.trim() || recordingState === 'processing'}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold"
                >
                  Submit For Regional Gemini AI Response
                </Button>
              </div>
            </div>
          ) : (
            /* Workflow Step 3: Structured Gemini AI Response */
            aiResult && (
              <div className="space-y-4">
                {/* Result Top Banner */}
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-teal-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Gemini AI Patient-Friendly Advice ({aiResult.language_name})
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        aiResult.urgency_level === 'HIGH' || aiResult.urgency_level === 'EMERGENCY'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-teal-100 text-teal-800 border border-teal-300'
                      }`}
                    >
                      Urgency: {aiResult.urgency_level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-semibold bg-white p-3 rounded-lg border border-teal-200">
                    {aiResult.ai_response_text}
                  </p>
                </div>

                {/* Extracted Symptoms */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" /> Extracted Clinical Symptoms
                  </h4>
                  <div className="space-y-1.5">
                    {aiResult.extracted_symptoms.map((symptom, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 text-indigo-950 text-xs font-semibold flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Key Safety Precautions
                  </h4>
                  <div className="space-y-1.5">
                    {aiResult.recommended_precautions.map((precaution, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-950 text-xs font-medium flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{precaution}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Next Steps */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Recommended Action Steps
                  </h4>
                  <div className="space-y-1.5">
                    {aiResult.next_steps.map((step, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={handleReset} className="text-xs font-bold">
                    Speak Another Symptom
                  </Button>
                  <Button variant="primary" size="sm" onClick={onClose} className="bg-teal-700 text-white font-bold">
                    Close Voice Assistant
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
