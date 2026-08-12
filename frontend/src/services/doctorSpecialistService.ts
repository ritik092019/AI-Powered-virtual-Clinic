import axios from 'axios';
import {
  DoctorSpecialist,
  DoctorSpecialistListResponse,
  DoctorSpecialistFilterParams
} from '../types/doctorSpecialist';
import { DoctorSpecialistFormOutput } from '../schemas/doctorSpecialistSchema';

const API_BASE = '/api/v1/admin/doctors';

export const doctorSpecialistService = {
  /**
   * Fetch paginated doctor specialists list with search & filter parameters
   */
  getDoctors: async (params: DoctorSpecialistFilterParams = {}): Promise<DoctorSpecialistListResponse> => {
    const queryParams: Record<string, any> = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search) queryParams.search = params.search;
    if (params.specialization && params.specialization !== 'ALL') queryParams.specialization = params.specialization;
    if (params.availability && params.availability !== 'ALL') queryParams.availability = params.availability;
    if (params.is_active !== undefined) queryParams.is_active = params.is_active;

    const response = await axios.get(API_BASE, { params: queryParams });
    return response.data.data;
  },

  /**
   * Fetch single doctor specialist profile by UUID
   */
  getDoctorById: async (id: string): Promise<DoctorSpecialist> => {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data.data;
  },

  /**
   * Create a new doctor specialist
   */
  createDoctor: async (data: DoctorSpecialistFormOutput): Promise<DoctorSpecialist> => {
    const response = await axios.post(API_BASE, data);
    return response.data.data;
  },

  /**
   * Update doctor specialist profile details
   */
  updateDoctor: async (id: string, data: Partial<DoctorSpecialistFormOutput>): Promise<DoctorSpecialist> => {
    const response = await axios.put(`${API_BASE}/${id}`, data);
    return response.data.data;
  },

  /**
   * Toggle doctor account active / inactive status
   */
  toggleDoctorStatus: async (id: string, is_active: boolean): Promise<DoctorSpecialist> => {
    const response = await axios.patch(`${API_BASE}/${id}/status`, { is_active });
    return response.data.data;
  },
};
