import React from 'react';
import { Spinner } from '../ui/Spinner';
import { Skeleton } from '../ui/Skeleton';
import { Card, CardHeader, CardContent } from '../ui/Card';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading clinic telemetry and records...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center my-8">
      <Spinner size="lg" label={message} />
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 animate-bounce">
        <span className="text-xl font-black text-teal-700">A</span>
      </div>
      <Spinner size="lg" label="Initializing Virtual Clinic Workspace..." />
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <Card variant="flat" className="p-5 space-y-3">
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" className="h-4 w-1/3" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-20 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="h-3 w-20" />
        <Skeleton variant="text" className="h-6 w-16" />
      </div>
    </Card>
  );
};
