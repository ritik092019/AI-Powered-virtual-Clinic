import { API_BASE_URL, getAuthHeaders } from '../constants';

export interface DoctorInHospital {
  name: string;
  specialty: string;
  qualifications?: string;
  availability_status?: string;
}

export interface RuralHospitalModel {
  id: string;
  name: string;
  code: string;
  village_area: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contact_number: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  availability_status: 'Beds Available' | 'Limited' | 'Full' | string;
  doctors_available_count: number;
  doctor_specialties: DoctorInHospital[];
  distance_km?: number;
  last_updated_at: string;
}

export interface RuralMedicineModel {
  id: string;
  medicine_name: string;
  purpose: string;
  quantity: number;
  availability_status: 'In Stock' | 'Limited Stock' | 'Out of Stock' | 'In Transit' | string;
  supplier_name: string;
  supplier_address: string;
  contact_number: string;
  village_area: string;
  order_status: string;
  expected_delivery?: string;
  last_updated_at: string;
}

export interface MedicineCreateUpdatePayload {
  medicine_name: string;
  purpose: string;
  quantity: number;
  availability_status: string;
  supplier_name: string;
  supplier_address: string;
  contact_number: string;
  village_area: string;
  order_status: string;
  expected_delivery?: string;
}

export interface HospitalBedUpdatePayload {
  total_beds: number;
  occupied_beds: number;
  doctors_available_count?: number;
}

export const ruralHealthcareService = {
  async getHospitals(params: {
    village_area?: string;
    specialty?: string;
    bed_status?: string;
    search?: string;
    user_lat?: number;
    user_lng?: number;
  } = {}): Promise<RuralHospitalModel[]> {
    const query = new URLSearchParams();
    if (params.village_area) query.append('village_area', params.village_area);
    if (params.specialty) query.append('specialty', params.specialty);
    if (params.bed_status) query.append('bed_status', params.bed_status);
    if (params.search) query.append('search', params.search);
    if (params.user_lat) query.append('user_lat', params.user_lat.toString());
    if (params.user_lng) query.append('user_lng', params.user_lng.toString());

    const res = await fetch(`${API_BASE_URL}/rural-healthcare/hospitals?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to fetch rural hospitals.');
    }
    return data.data;
  },

  async getHospitalById(id: string): Promise<RuralHospitalModel> {
    const res = await fetch(`${API_BASE_URL}/rural-healthcare/hospitals/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to fetch hospital details.');
    }
    return data.data;
  },

  async getMedicines(params: {
    village_area?: string;
    status_filter?: string;
    search?: string;
  } = {}): Promise<RuralMedicineModel[]> {
    const query = new URLSearchParams();
    if (params.village_area) query.append('village_area', params.village_area);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/rural-healthcare/medicines?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to fetch rural medicine availability.');
    }
    return data.data;
  },

  async addMedicine(payload: MedicineCreateUpdatePayload): Promise<RuralMedicineModel> {
    const res = await fetch(`${API_BASE_URL}/rural-healthcare/medicines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to add medicine stock.');
    }
    return data.data;
  },

  async updateMedicine(id: string, payload: MedicineCreateUpdatePayload): Promise<RuralMedicineModel> {
    const res = await fetch(`${API_BASE_URL}/rural-healthcare/medicines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to update medicine stock.');
    }
    return data.data;
  },

  async updateHospitalBeds(id: string, payload: HospitalBedUpdatePayload): Promise<RuralHospitalModel> {
    const res = await fetch(`${API_BASE_URL}/rural-healthcare/hospitals/${id}/beds`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Failed to update hospital bed status.');
    }
    return data.data;
  },
};
