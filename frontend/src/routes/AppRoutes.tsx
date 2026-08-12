import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PatientsPage } from '../pages/PatientsPage';
import { PatientRegistrationPage } from '../pages/PatientRegistrationPage';
import { PatientDetailPage } from '../pages/PatientDetailPage';
import { ConsultationsPage } from '../pages/ConsultationsPage';
import { NewConsultationPage } from '../pages/NewConsultationPage';
import { AIAssessmentPage } from '../pages/AIAssessmentPage';
import { TeleConsultPage } from '../pages/TeleConsultPage';
import { DoctorRequestsPage } from '../pages/DoctorRequestsPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { DoctorDashboardPage } from '../pages/DoctorDashboardPage';
import { DoctorCasePage } from '../pages/DoctorCasePage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { DoctorSpecialistManagementPage } from '../pages/DoctorSpecialistManagementPage';
import { PatientPortalPage } from '../pages/PatientPortalPage';
import { PatientDashboardPage } from '../pages/PatientDashboardPage';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Main Application Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
          <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="/patient-portal" element={<PatientPortalPage />} />
          <Route path="/consultations" element={<ConsultationsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/unauthorized" element={<AccessDeniedPage />} />

          {/* Health Worker & Clinical Intake Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['HEALTH_WORKER', 'DOCTOR', 'ADMIN']} />}>
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<PatientRegistrationPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/consultations/new" element={<NewConsultationPage />} />
            <Route path="/consultations/:id" element={<AIAssessmentPage />} />
            <Route path="/consultations/:id/tele-consult" element={<TeleConsultPage />} />
            <Route path="/doctor-requests" element={<DoctorRequestsPage />} />
          </Route>

          {/* Specialized Doctor View */}
          <Route element={<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']} />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
            <Route path="/doctor/case/:id" element={<DoctorCasePage />} />
          </Route>

          {/* Specialized Admin View */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/doctors" element={<DoctorSpecialistManagementPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

