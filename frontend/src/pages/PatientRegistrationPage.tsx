import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientRegistrationWizard } from '../components/patients/PatientRegistrationWizard';
import { Button } from '../components/ui/Button';
import { ArrowLeft, UserPlus } from 'lucide-react';

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patients')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Patients
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" /> New Patient Registration
            </h1>
            <p className="text-xs text-slate-500">
              Complete the multi-step intake form to initialize a village patient record.
            </p>
          </div>
        </div>
      </div>

      <PatientRegistrationWizard />
    </div>
  );
};
