import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from '../components/common/ToastContainer';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Outlet />
      </div>

      <ToastContainer />
    </div>
  );
};
