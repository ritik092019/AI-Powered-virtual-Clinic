import React from 'react';
import { Card } from '../ui/Card';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat Cards Skeleton (5 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-slate-100 p-5 rounded-xl border border-slate-200 h-28 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            <div className="h-8 bg-slate-300 rounded w-1/2"></div>
            <div className="h-2.5 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-12 bg-slate-100 rounded-lg"></div>
            <div className="h-12 bg-slate-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
