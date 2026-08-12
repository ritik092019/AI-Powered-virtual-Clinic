import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { DEFAULT_SYSTEM_STATUS } from '../../constants';

export const ConnectionStatus: React.FC = () => {
  const status = DEFAULT_SYSTEM_STATUS;

  return (
    <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
      {status.isOnline ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px]">Sync Active ({status.latencyMs}ms)</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] text-amber-800">Local Cache</span>
        </>
      )}
    </div>
  );
};
