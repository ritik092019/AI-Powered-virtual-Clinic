import React, { useState, useEffect } from 'react';
import { speechService } from '../../services/speechService';
import { Mic, MicOff, RefreshCw, CheckCircle2, AlertTriangle, Globe, Volume2, StopCircle, Trash2, Edit3, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface VoiceRecorderProps {
  confirmedVoiceData?: {
    language: string;
    rawTranscript: string;
    confirmedTranscript: string;
    confirmedAt?: string;
  };
  onConfirmVoiceData: (voiceData: {
    language: string;
    rawTranscript: string;
    confirmedTranscript: string;
    confirmedAt: string;
  }) => void;
  onClearVoiceData: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ch', label: 'Chhattisgarhi (छत्तीसगढ़ी)' },
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'gon', label: 'Gondi / Kurukh (गोंडी)' },
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  confirmedVoiceData,
  onConfirmVoiceData,
  onClearVoiceData,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [recordingState, setRecordingState] = useState<'ready' | 'listening' | 'processing' | 'ready_to_confirm' | 'failed' | 'cancelled'>('ready');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transcript state before confirmation
  const [rawTranscript, setRawTranscript] = useState('');
  const [translatedEnglish, setTranslatedEnglish] = useState('');
  const [editedTranscript, setEditedTranscript] = useState('');

  // Recording timer effect
  useEffect(() => {
    let interval: any = null;
    if (recordingState === 'listening') {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const handleStartRecording = () => {
    setErrorMessage(null);
    setRecordingSeconds(0);
    setRecordingState('listening');
  };

  const handleStopRecordingAndProcess = async () => {
    setRecordingState('processing');
    try {
      const result = await speechService.simulateTranscription(selectedLanguage);
      setRawTranscript(result.rawTranscript);
      setTranslatedEnglish(result.translatedEnglish);
      setEditedTranscript(result.translatedEnglish || result.rawTranscript);
      setRecordingState('ready_to_confirm');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process audio recording.');
      setRecordingState('failed');
    }
  };

  const handleCancelRecording = () => {
    setRecordingSeconds(0);
    setRecordingState('cancelled');
    setTimeout(() => setRecordingState('ready'), 1000);
  };

  const handleConfirmTranscript = () => {
    onConfirmVoiceData({
      language: selectedLanguage,
      rawTranscript: rawTranscript,
      confirmedTranscript: editedTranscript,
      confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setRecordingState('ready');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-4 h-4 text-teal-600" />
            Vernacular Speech Dictation & Audio Note
          </h3>
          <p className="text-xs text-slate-500">Record clinical audio in regional dialect to transcribe into medical text.</p>
        </div>

        {/* Language Select Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={recordingState === 'listening' || recordingState === 'processing'}
            className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:ring-1 focus:ring-teal-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Confirmed Voice Transcript Banner */}
      {confirmedVoiceData ? (
        <div className="p-4 bg-teal-50 border border-teal-300 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Voice Transcript Confirmed & Added to Intake</span>
            </div>
            <span className="text-xs text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
              Confirmed at {confirmedVoiceData.confirmedAt} • Language: {confirmedVoiceData.language.toUpperCase()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="text-slate-500 font-semibold uppercase text-[10px]">Original Speech Audio Transcript:</div>
            <p className="text-slate-700 font-mono italic bg-slate-50 p-2 rounded">{confirmedVoiceData.rawTranscript}</p>

            <div className="text-slate-500 font-semibold uppercase text-[10px] pt-1">
              Confirmed English Translation for AI Intake:
            </div>
            <p className="text-slate-900 font-medium">{confirmedVoiceData.confirmedTranscript}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearVoiceData}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
            >
              Re-record Voice
            </Button>
          </div>
        </div>
      ) : (
        /* Recording Controls Box */
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center space-y-4 text-center">
          {/* State 1: READY */}
          {recordingState === 'ready' && (
            <div className="space-y-3 flex flex-col items-center">
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-16 h-16 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
              >
                <Mic className="w-8 h-8" />
              </button>
              <div>
                <span className="font-bold text-sm text-slate-800 block">Tap Microphone to Start Dictation</span>
                <span className="text-xs text-slate-500">
                  Speak clearly in selected language ({SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label})
                </span>
              </div>
            </div>
          )}

          {/* State 2: LISTENING / RECORDING */}
          {recordingState === 'listening' && (
            <div className="space-y-4 flex flex-col items-center">
              {/* Pulsing visualizer */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-rose-500/20 animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl relative z-10">
                  <Volume2 className="w-10 h-10 animate-bounce" />
                </div>
              </div>

              <div>
                <span className="font-bold text-base text-rose-700 block">Recording Active ({recordingSeconds}s)</span>
                <span className="text-xs text-slate-500">Listening to patient symptoms in regional dialect...</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStopRecordingAndProcess}
                  leftIcon={<StopCircle className="w-4 h-4" />}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Stop & Process Speech
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancelRecording}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* State 3: PROCESSING */}
          {recordingState === 'processing' && (
            <div className="space-y-3 flex flex-col items-center py-4">
              <RefreshCw className="w-10 h-10 text-teal-600 animate-spin" />
              <div>
                <span className="font-bold text-sm text-slate-800 block">Processing Speech to Clinical Text...</span>
                <span className="text-xs text-slate-500">Running vernacular speech-to-text translation engine</span>
              </div>
            </div>
          )}

          {/* State 4: TRANSCRIPT READY FOR CONFIRMATION */}
          {recordingState === 'ready_to_confirm' && (
            <div className="w-full space-y-4 text-left bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Review & Confirm Speech Transcript
                </span>
                <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                  {selectedLanguage.toUpperCase()} Detected
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block">
                    Original Speech Transcript:
                  </label>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 font-mono text-slate-700 mt-1">
                    {rawTranscript}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                    Confirmed Medical Translation (Editable):
                  </label>
                  <textarea
                    rows={3}
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => setRecordingState('ready')}>
                  Discard & Re-record
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmTranscript}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Confirm & Add Transcript to Intake
                </Button>
              </div>
            </div>
          )}

          {/* State 5: FAILED */}
          {recordingState === 'failed' && (
            <div className="space-y-3 flex flex-col items-center">
              <AlertTriangle className="w-10 h-10 text-rose-600" />
              <div>
                <span className="font-bold text-sm text-rose-700 block">Speech Processing Failed</span>
                <span className="text-xs text-slate-500">{errorMessage}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setRecordingState('ready')}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
