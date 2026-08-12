import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export const OfflineBanner: React.FC<{ isOnline?: boolean; syncCount?: number }> = ({
  isOnline = true,
  syncCount = 0,
}) => {
  if (isOnline && syncCount === 0) return null;

  return (
    <div className="bg-amber-800 text-amber-50 px-4 py-2 text-xs flex items-center justify-between border-b border-amber-900 shadow-2xs">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
        <span>
          <strong>Offline Mode Active:</strong> Working with local cached records.{' '}
          {syncCount > 0 ? `${syncCount} consultation drafts queued for cloud sync.` : ''}
        </span>
      </div>
      <Button variant="ghost" size="sm" className="text-amber-100 hover:bg-amber-700 h-7 text-xs">
        <RefreshCw className="w-3 h-3 mr-1" /> Force Sync
      </Button>
    </div>
  );
};
