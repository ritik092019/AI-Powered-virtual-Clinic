import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { Dropdown } from '../ui/Dropdown';
import { Globe, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, languages, setLanguage } = useLanguage();
  const { addToast } = useNotification();

  const handleLanguageChange = (code: string, nativeName: string) => {
    setLanguage(code);
    addToast({
      title: 'Language Updated',
      message: `Interface language switched to ${nativeName}.`,
      type: 'info',
    });
  };

  const items = languages.map((lang) => ({
    id: lang.code,
    label: (
      <div className="flex items-center justify-between w-full font-medium text-xs py-0.5">
        <span>
          {lang.flag} {lang.nativeName} <span className="text-slate-400 font-normal">({lang.name})</span>
        </span>
        {lang.code === currentLanguage.code && <Check className="w-3.5 h-3.5 text-teal-700 ml-2 shrink-0" />}
      </div>
    ),
    onClick: () => handleLanguageChange(lang.code, lang.nativeName),
  }));

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors focus:outline-none"
          aria-label="Select interface language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.nativeName}</span>
        </button>
      }
      items={items}
      align="right"
    />
  );
};
