import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useMyDoctorProfile() {
  return useQuery({
    queryKey: ['doctor', 'me'],
    queryFn: () => api.get('/doctors/me'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyAppointments(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['doctor', 'appointments', params],
    queryFn: () => api.get(`/doctors/my-appointments?${qs.toString()}`),
  });
}

export function useDoctors(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => api.get(`/doctors?${qs.toString()}`),
  });
}
