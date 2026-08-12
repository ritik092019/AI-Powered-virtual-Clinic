import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { Breadcrumb } from './Breadcrumb';
import { LanguageSelector } from './LanguageSelector';
import { UserProfileMenu } from './UserProfileMenu';
import { ConnectionStatus } from '../common/ConnectionStatus';
import { Dropdown } from '../ui/Dropdown';
import { Menu, Bell, CheckCheck, Sparkles } from 'lucide-react';
import { APP_NAME } from '../../constants';

interface TopbarProps {
  onOpenMobileNav: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileNav }) => {
  const location = useLocation();
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  const getPageTitle = (path: string) => {
    if (path.includes('/patients')) return 'Patient Registry & Records';
    if (path.includes('/consultations')) return 'Clinical Consultations & Triage';
    if (path.includes('/doctor-requests')) return 'Doctor Telemedicine Queue';
    if (path.includes('/documents')) return 'Medical Document Repository & OCR';
    if (path.includes('/notifications')) return 'Clinical Alerts & Notifications';
    if (path.includes('/settings')) return 'System Preferences & Offline Sync';
    if (path.includes('/doctor/dashboard')) return 'Doctor Specialist Workspace';
    if (path.includes('/admin/dashboard')) return 'District Operations & Telemedicine Admin';
    return 'Rural Health AI Assistant';
  };

  const notificationItems = [
    {
      id: 'notif-header',
      label: (
        <div className="flex items-center justify-between py-1 px-1">
          <span className="font-bold text-xs text-slate-900">Clinical Alerts</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="text-[11px] text-teal-700 hover:text-teal-900 flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
        </div>
      ),
      disabled: true,
    },
    { id: 'd1', label: '', divider: true },
    ...notifications.map((n) => ({
      id: n.id,
      label: (
        <div className="py-1">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-semibold text-xs text-slate-900">{n.title}</span>
            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
          </div>
          <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
        </div>
      ),
    })),
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left Title & Mobile Menu Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
              {getPageTitle(location.pathname)}
            </h1>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200 shrink-0">
              <Sparkles className="w-3 h-3 text-teal-600" />
              AI Assists • Doctors Decide
            </span>
          </div>
          <Breadcrumb />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Connection Status Badge */}
        <ConnectionStatus />

        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications Icon */}
        <Dropdown
          trigger={
            <button
              type="button"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>
          }
          items={notificationItems}
          align="right"
        />

        {/* User Profile & Role Switcher */}
        <UserProfileMenu />
      </div>
    </header>
  );
};
