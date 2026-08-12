export type DoctorAvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface DoctorSpecialist {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'DOCTOR';
  is_active: boolean;
  specialization: string;
  qualifications: string;
  experience_years: number;
  license_number: string;
  address?: string;
  city_state?: string;
  languages: string[];
  availability_status: DoctorAvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface DoctorSpecialistListResponse {
  doctors: DoctorSpecialist[];
  total: number;
  page: number;
  limit: number;
}

export interface DoctorSpecialistFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  availability?: DoctorAvailabilityStatus | 'ALL';
  is_active?: boolean;
}
