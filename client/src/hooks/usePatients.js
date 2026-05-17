import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function usePatients(params = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) queryParams.set(k, v); });
  const qs = queryParams.toString();

  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => api.get(`/patients${qs ? `?${qs}` : ''}`),
  });
}

export function usePatient(id) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => api.get(`/patients/${id}`),
    enabled: !!id,
  });
}

export function usePatientSearch(q) {
  return useQuery({
    queryKey: ['patients', 'search', q],
    queryFn: () => api.get(`/patients/search?q=${encodeURIComponent(q)}`),
    enabled: q?.length >= 2,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/patients', data),
    onSuccess: () => {
      toast.success('Patient registered successfully');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/patients/${id}`, data),
    onSuccess: () => {
      toast.success('Patient updated');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (err) => toast.error(err.message),
  });
}
