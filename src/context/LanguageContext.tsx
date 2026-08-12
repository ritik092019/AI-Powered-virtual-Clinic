import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';
import { TRANSLATIONS, LanguageCode } from '../translations';

interface LanguageContextType {
  currentLanguage: Language;
  languages: Language[];
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('arogya_lang');
    return LANGUAGES.find((l) => l.code === saved) || LANGUAGES[0];
  });

  useEffect(() => {
    // Set HTML lang attribute for screen readers & browser rendering
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  const setLanguage = (code: string) => {
    const found = LANGUAGES.find((l) => l.code === code);
    if (found) {
      setCurrentLanguageState(found);
      localStorage.setItem('arogya_lang', code);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langCode = (currentLanguage.code as LanguageCode) || 'en';
    const translationMap = TRANSLATIONS[langCode];
    if (translationMap && translationMap[key]) {
      return translationMap[key];
    }
    // Fallback to English if key missing in selected language
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, languages: LANGUAGES, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
