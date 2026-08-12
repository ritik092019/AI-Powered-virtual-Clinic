import React from 'react';
import { Patient } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Shield,
  Stethoscope,
  FilePlus,
  ImagePlus,
  UserCheck,
  Edit3,
  Phone,
  MapPin,
  Calendar,
  Languages,
  AlertCircle,
} from 'lucide-react';

interface PatientProfileHeaderProps {
  patient: Patient;
  onStartConsultation: () => void;
  onUploadDocument: () => void;
  onUploadImage: () => void;
  onRequestDoctor: () => void;
  onEditProfile: () => void;
}

export const PatientProfileHeader: React.FC<PatientProfileHeaderProps> = ({
  patient,
  onStartConsultation,
  onUploadDocument,
  onUploadImage,
  onRequestDoctor,
  onEditProfile,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 md:p-6 space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            {patient.name[0]}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{patient.name}</h1>
              <Badge variant="info">{patient.gender}, {patient.age} yrs</Badge>
              {patient.bloodGroup && <Badge variant="default">{patient.bloodGroup}</Badge>}
              <Badge variant="neutral">
                <Languages className="w-3 h-3 mr-1 inline" />
                {patient.preferredLanguage || 'Hindi'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono font-medium text-slate-700">ID: {patient.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {patient.village}, {patient.district}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {patient.phone}
              </span>
            </div>

            {patient.abhaId && (
              <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md mt-2 w-fit">
                <Shield className="w-3.5 h-3.5 text-teal-700" />
                <span>ABHA ID: {patient.abhaId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Button Header Right */}
        <div className="flex items-center space-x-2 self-start lg:self-center">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Primary Action Button Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          variant="primary"
          leftIcon={<Stethoscope className="w-4 h-4" />}
          onClick={onStartConsultation}
        >
          Start New Consultation
        </Button>

        <Button
          variant="secondary"
          leftIcon={<FilePlus className="w-4 h-4" />}
          onClick={onUploadDocument}
        >
          Upload Document
        </Button>

        <Button
          variant="outline"
          leftIcon={<ImagePlus className="w-4 h-4" />}
          onClick={onUploadImage}
        >
          Upload Image
        </Button>

        <Button
          variant="ghost"
          leftIcon={<UserCheck className="w-4 h-4 text-purple-600" />}
          onClick={onRequestDoctor}
          className="text-purple-700 hover:bg-purple-50"
        >
          Request Doctor
        </Button>
      </div>
    </div>
  );
};
