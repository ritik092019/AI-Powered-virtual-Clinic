import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-white text-teal-900 shadow-2xs border border-slate-200/60 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50',
                tab.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] rounded-full font-bold',
                    isActive ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('border-b border-slate-200 flex space-x-6 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none',
              isActive
                ? 'border-teal-700 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
