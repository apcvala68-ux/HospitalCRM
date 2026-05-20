import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useMyDoctorProfile(enabled = true) {
  return useQuery({
    queryKey: ['doctor', 'me'],
    queryFn: () => api.get('/doctors/me'),
    staleTime: 5 * 60 * 1000,
    enabled,
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

export function useDoctor(id) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/doctors/${id}`),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/doctors', data),
    onSuccess: () => { toast.success('Doctor created'); qc.invalidateQueries({ queryKey: ['doctors'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/doctors/${id}`, data),
    onSuccess: () => { toast.success('Doctor updated'); qc.invalidateQueries({ queryKey: ['doctors'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => api.delete(`/doctors/${id}`),
    onSuccess: () => { toast.success('Doctor deactivated'); qc.invalidateQueries({ queryKey: ['doctors'] }); },
    onError: (err) => toast.error(err.message),
  });
}
