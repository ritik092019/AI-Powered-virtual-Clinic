import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { Dropdown } from '../ui/Dropdown';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LogOut, UserCheck, ShieldAlert, Stethoscope, Settings, ChevronDown, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../types';

export const UserProfileMenu: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const { currentLanguage } = useLanguage();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const handleRoleSwitch = (r: Role) => {
    switchRole(r);
    addToast({
      title: 'Role Switched',
      message: `Active role updated to ${
        r === 'HEALTH_WORKER'
          ? 'Health Worker'
          : r === 'DOCTOR'
          ? 'Doctor Specialist'
          : r === 'PATIENT'
          ? 'Patient Self Service'
          : 'District Admin'
      }.`,
      type: 'info',
    });
    if (r === 'DOCTOR') navigate('/doctor/dashboard');
    else if (r === 'ADMIN') navigate('/admin/dashboard');
    else if (r === 'PATIENT') navigate('/patient-portal');
    else navigate('/dashboard');
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    addToast({
      title: 'Logged Out',
      message: 'Signed out of Arogya Health AI Virtual Clinic.',
      type: 'info',
    });
    navigate('/login');
  };

  const items = [
    {
      id: 'profile-info',
      label: (
        <div className="py-1">
          <p className="font-bold text-slate-900 text-xs">{user.name}</p>
          <p className="text-[11px] text-slate-500 truncate">{user.title}</p>
          <p className="text-[10px] text-teal-700 truncate font-semibold mt-0.5">{user.centerName}</p>
          {user.badgeNumber && (
            <p className="text-[10px] text-slate-400 mt-0.5">ID: {user.badgeNumber}</p>
          )}
        </div>
      ),
      disabled: true,
    },
    { id: 'div0', label: '', divider: true },
    {
      id: 'settings',
      label: 'Portal Settings & Offline Sync',
      icon: <Settings className="w-3.5 h-3.5 text-slate-500" />,
      onClick: () => navigate('/settings'),
    },
    {
      id: 'lang',
      label: (
        <div className="flex items-center justify-between w-full">
          <span>Language: {currentLanguage.name}</span>
          <span className="text-xs">{currentLanguage.flag}</span>
        </div>
      ),
      icon: <Globe className="w-3.5 h-3.5 text-teal-600" />,
      onClick: () => navigate('/settings'),
    },
    { id: 'div1', label: '', divider: true },
    {
      id: 'switch-hw',
      label: 'Switch to Health Worker View',
      icon: <UserCheck className="w-3.5 h-3.5 text-teal-600" />,
      onClick: () => handleRoleSwitch('HEALTH_WORKER'),
    },
    {
      id: 'switch-patient',
      label: 'Switch to Patient Self-View',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
      onClick: () => handleRoleSwitch('PATIENT'),
    },
    {
      id: 'switch-doc',
      label: 'Switch to Doctor Specialist View',
      icon: <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />,
      onClick: () => handleRoleSwitch('DOCTOR'),
    },
    {
      id: 'switch-admin',
      label: 'Switch to District Admin View',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />,
      onClick: () => handleRoleSwitch('ADMIN'),
    },
    { id: 'div2', label: '', divider: true },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut className="w-3.5 h-3.5 text-rose-600" />,
      danger: true,
      onClick: () => setShowLogoutModal(true),
    },
  ];

  return (
    <>
      <Dropdown
        trigger={
          <button
            type="button"
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none"
          >
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[10px] font-medium text-teal-700">
                {user.role === 'HEALTH_WORKER' ? 'ASHA Worker' : user.role === 'DOCTOR' ? 'Doctor' : 'Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>
        }
        items={items}
        align="right"
      />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out Confirmation"
        description="Are you sure you want to log out of the Arogya Health AI Virtual Clinic?"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Unsaved draft consultation records on this tablet will remain safely cached in offline browser storage.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLogout} leftIcon={<LogOut className="w-4 h-4" />}>
              Yes, Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

