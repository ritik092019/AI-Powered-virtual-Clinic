import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { ToastContainer } from '../components/common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Offline Banner if any */}
        <OfflineBanner />

        {/* Top Navbar */}
        <Topbar onOpenMobileNav={() => setIsMobileNavOpen(true)} />

        {/* Global Healthcare Safety Notice Top Banner */}
        <div className="px-4 sm:px-6 pt-4 max-w-7xl w-full mx-auto">
          <HealthcareSafetyNotice compact />
        </div>

        {/* Route Page Container */}
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto focus:outline-none">
          <Outlet />
        </main>

        {/* Global Toast Overlay */}
        <ToastContainer />
      </div>
    </div>
  );
};
