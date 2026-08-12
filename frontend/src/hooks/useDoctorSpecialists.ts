import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorSpecialistService } from '../services/doctorSpecialistService';
import { DoctorSpecialistFilterParams } from '../types/doctorSpecialist';
import { DoctorSpecialistFormOutput } from '../schemas/doctorSpecialistSchema';

export const DOCTORS_QUERY_KEY = ['doctorSpecialists'];

/**
 * Hook to fetch paginated doctor specialists with search & filter controls
 */
export function useDoctorSpecialists(filters: DoctorSpecialistFilterParams = {}) {
  return useQuery({
    queryKey: [...DOCTORS_QUERY_KEY, filters],
    queryFn: () => doctorSpecialistService.getDoctors(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

/**
 * Hook to fetch single doctor details
 */
export function useDoctorSpecialistDetail(id: string) {
  return useQuery({
    queryKey: [...DOCTORS_QUERY_KEY, 'detail', id],
    queryFn: () => doctorSpecialistService.getDoctorById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new doctor specialist
 */
export function useCreateDoctorSpecialist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DoctorSpecialistFormOutput) => doctorSpecialistService.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });
    },
  });
}

/**
 * Hook to update an existing doctor specialist
 */
export function useUpdateDoctorSpecialist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DoctorSpecialistFormOutput> }) =>
      doctorSpecialistService.updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });
    },
  });
}

/**
 * Hook to activate / deactivate doctor account status
 */
export function useToggleDoctorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      doctorSpecialistService.toggleDoctorStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });
    },
  });
}
