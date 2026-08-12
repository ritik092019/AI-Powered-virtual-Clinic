import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Role } from '../types';
import { APP_NAME, APP_SUBTITLE } from '../constants';
import {
  HeartPulse,
  UserCheck,
  Stethoscope,
  User,
  ShieldAlert,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Award,
  Calendar,
  Phone,
  FileCheck,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addToast } = useNotification();

  // Role Tab State (PATIENT, HEALTH_WORKER, DOCTOR)
  const [selectedRole, setSelectedRole] = useState<Role>('PATIENT');

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Health Worker Specific Fields
  const [centerName, setCenterName] = useState('');
  const [district, setDistrict] = useState('Surguja');

  // Doctor Specific Fields
  const [specialty, setSpecialty] = useState('General Medicine / Tele-Consultant');
  const [qualifications, setQualifications] = useState('MBBS, MD');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Patient Specific Fields
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const createdUser = await register({
        name,
        email,
        password,
        role: selectedRole,
        phone,
        center_name: centerName,
        district,
        specialty,
        qualifications,
        registration_number: registrationNumber,
        age: age === '' ? undefined : Number(age),
        gender,
        address,
      });

      addToast({
        title: 'Account Created Successfully!',
        message: `Welcome ${createdUser.name} to ${APP_NAME}.`,
        type: 'success',
      });

      // Redirect based on decoded user role
      if (createdUser.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (createdUser.role === 'PATIENT') navigate('/patient-portal');
      else if (createdUser.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center mx-auto font-black text-2xl shadow-lg">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Your Clinic Account</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          {APP_SUBTITLE}
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">Select Registration Role</label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedRole('PATIENT')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'PATIENT'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('HEALTH_WORKER')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'HEALTH_WORKER'
                ? 'bg-white text-teal-700 shadow-xs border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Health Worker
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('DOCTOR')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              selectedRole === 'DOCTOR'
                ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Registration Failed">
          {error}
        </Alert>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Full Name *"
            type="text"
            placeholder={selectedRole === 'DOCTOR' ? 'Dr. Rajesh Verma' : 'Ramesh Patel'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="user@clinic.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password *"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="Confirm Password *"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Input
          label="Phone Number (WhatsApp / SMS)"
          type="tel"
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />

        {/* Role-Specific Fields */}
        {selectedRole === 'PATIENT' && (
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-3">
            <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Patient Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Age (Years)"
                type="number"
                placeholder="45"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Gender</label>
                <select
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 outline-none focus:border-emerald-500"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <Input
              label="Village / Address"
              placeholder="Village Rampur, District Surguja"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
          </div>
        )}

        {selectedRole === 'HEALTH_WORKER' && (
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-3">
            <p className="text-[11px] font-bold text-teal-900 uppercase tracking-wider">Health Worker Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Sub-Health Centre / Facility Name"
                placeholder="Sub-Health Centre Rampur"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />
              <Input
                label="District / Block"
                placeholder="Surguja"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        {selectedRole === 'DOCTOR' && (
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3">
            <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Doctor Credentials</p>
            <Input
              label="Specialty / Medical Designation"
              placeholder="General Medicine / Tele-Consultant"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Qualifications"
                placeholder="MBBS, MD"
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                leftIcon={<Award className="w-4 h-4" />}
              />
              <Input
                label="Medical Council Reg. Number"
                placeholder="MCI-889021"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                leftIcon={<FileCheck className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          leftIcon={<Lock className="w-4 h-4" />}
        >
          Create Account & Register
        </Button>
      </form>

      {/* Admin Notice */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
        <ShieldAlert className="w-4 h-4 text-amber-600 inline mr-1" />
        <strong>Admin Accounts:</strong> Admin registration is restricted. Existing administrators can create admin credentials in the Admin Portal.
      </div>

      {/* Navigation Link to Login */}
      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-teal-700 font-bold hover:underline">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
