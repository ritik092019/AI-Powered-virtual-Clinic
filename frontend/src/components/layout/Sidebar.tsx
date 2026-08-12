import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';
import { APP_NAME } from '../../constants';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  Bell,
  Settings,
  ShieldCheck,
  Activity,
  HeartPulse,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { role, user } = useAuth();
  const { unreadCount } = useNotification();
  const { t } = useLanguage();
  const location = useLocation();

  // Primary navigation for Health Workers, Doctors, Admin, Patients
  const primaryNavItems = [
    {
      title: t('nav.dashboard', 'Dashboard'),
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      allowedRoles: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN'],
    },
    {
      title: 'Patient Dashboard',
      path: '/patient-dashboard',
      icon: <LayoutDashboard className="w-5 h-5 text-teal-600" />,
      allowedRoles: ['PATIENT'],
    },
    {
      title: t('nav.patients', 'Patient Registry'),
      path: '/patients',
      icon: <Users className="w-5 h-5" />,
      allowedRoles: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN'],
    },
    {
      title: t('nav.consultations', 'Consultations'),
      path: '/consultations',
      icon: <Activity className="w-5 h-5" />,
      allowedRoles: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN'],
    },
    {
      title: t('nav.doctor_requests', 'Doctor Requests'),
      path: '/doctor-requests',
      icon: <Stethoscope className="w-5 h-5" />,
      allowedRoles: ['HEALTH_WORKER', 'ADMIN'],
    },
    {
      title: t('nav.documents', 'Medical Records'),
      path: '/documents',
      icon: <FileText className="w-5 h-5" />,
      allowedRoles: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN', 'PATIENT'],
    },
    {
      title: t('nav.notifications', 'Alerts'),
      path: '/notifications',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      allowedRoles: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN', 'PATIENT'],
    },
    {
      title: t('nav.settings', 'Settings'),
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      allowedRoles: ['HEALTH_WORKER', 'DOCTOR', 'ADMIN', 'PATIENT'],
    },
  ].filter((item) => item.allowedRoles.includes(role));

  const roleNavItems = [
    {
      title: 'Doctor Telemedicine Hub',
      path: '/doctor/dashboard',
      icon: <Stethoscope className="w-5 h-5 text-indigo-500" />,
      allowedRoles: ['DOCTOR', 'ADMIN'],
    },
    {
      title: 'Doctor Specialist Roster',
      path: '/admin/doctors',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      allowedRoles: ['ADMIN'],
    },
    {
      title: 'District Admin Ops',
      path: '/admin/dashboard',
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      allowedRoles: ['ADMIN'],
    },
  ].filter((item) => item.allowedRoles.includes(role));

  return (
    <aside
      className={cn(
        'h-screen bg-white text-slate-700 flex flex-col justify-between transition-all duration-300 border-r border-slate-200 select-none z-30 shrink-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-teal-800 text-sm tracking-tight truncate">
                  {APP_NAME}
                </span>
                <span className="text-[10px] text-teal-600 font-medium tracking-wide flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Rural Health AI
                </span>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors hidden lg:flex"
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
          {/* General Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {role === 'PATIENT' ? 'Patient Portal' : 'Clinical Workflow'}
              </p>
            )}
            {primaryNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 group relative',
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <span className={cn('shrink-0', isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600')}>
                    {item.icon}
                  </span>

                  {!isCollapsed && <span className="truncate flex-1">{item.title}</span>}

                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-[10px] font-bold rounded-full',
                        isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Role Navigation Section */}
          {roleNavItems.length > 0 && (
            <div className="space-y-1 pt-3 border-t border-slate-200">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Specialized Hubs
                </p>
              )}
              {roleNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 group',
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer User Info & Status */}
      <div className="p-3 border-t border-slate-200">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center mb-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {role === 'PATIENT' ? 'Patient Access' : 'System Status'}
            </span>
          </div>
          {!isCollapsed ? (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700 truncate">{user?.name}</span>
              <span className="text-[11px] text-slate-500 truncate">{user?.centerName}</span>
            </div>
          ) : (
            <span className="text-[10px] text-emerald-600 font-bold">Online</span>
          )}
        </div>
      </div>
    </aside>
  );
};
