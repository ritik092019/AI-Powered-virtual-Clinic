import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    patients: 'Patients',
    consultations: 'Consultations',
    'doctor-requests': 'Doctor Requests',
    documents: 'Documents',
    notifications: 'Notifications',
    settings: 'Settings',
    doctor: 'Doctor Telemedicine',
    admin: 'District Operations',
  };

  if (pathnames.length === 0 || pathnames[0] === 'login') return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center space-x-1.5 text-xs text-slate-500">
      <Link
        to="/dashboard"
        className="hover:text-teal-700 transition-colors flex items-center gap-1"
        aria-label="Home Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800" aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-teal-700 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
