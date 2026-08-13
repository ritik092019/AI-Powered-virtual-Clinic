import { Language, SystemStatus } from '../types';

export const APP_NAME = 'Arogya Health AI';
export const APP_SUBTITLE = 'Virtual Clinic & Clinical AI Decision Support for Rural Healthcare';
export const APP_VERSION = 'v1.1.0-frontend';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

export const DEFAULT_SYSTEM_STATUS: SystemStatus = {
  isOnline: true,
  syncPendingCount: 0,
  lastSyncedAt: 'Just now',
  latencyMs: 42,
  backendHealth: 'healthy',
};

export const HEALTHCARE_SAFETY_DISCLAIMER = {
  short: 'Arogya Health AI is an clinical assistance tool designed for rural healthcare workers. It does not replace qualified medical diagnosis.',
  full: 'This platform provides AI-assisted decision support and triage recommendations for frontline health workers. It is intended to complement, not replace, clinical judgment by qualified medical practitioners.',
};

export const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api/v1';

export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || localStorage.getItem('arogya_access_token') || localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

