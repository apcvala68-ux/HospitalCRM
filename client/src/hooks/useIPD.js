import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useWards() {
  return useQuery({ queryKey: ['ipd', 'wards'], queryFn: () => api.get('/ipd/wards') });
}

export function useWardBeds(wardId) {
  return useQuery({
    queryKey: ['ipd', 'beds', wardId],
    queryFn: () => api.get(`/ipd/wards/${wardId}/beds`),
    enabled: !!wardId,
    refetchInterval: 15000,
  });
}

export function useActiveAdmissions() {
  return useQuery({ queryKey: ['ipd', 'active'], queryFn: () => api.get('/ipd/active'), refetchInterval: 15000 });
}

export function useAdmission(id) {
  return useQuery({
    queryKey: ['ipd', id],
    queryFn: () => api.get(`/ipd/${id}`),
    enabled: !!id,
  });
}

export function useAdmitPatient() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/ipd/admit', data),
    onSuccess: () => { toast.success('Patient admitted'); qc.invalidateQueries({ queryKey: ['ipd'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useDischarge() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/ipd/${id}/discharge`, data),
    onSuccess: () => { toast.success('Patient discharged'); qc.invalidateQueries({ queryKey: ['ipd'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useAddVitals() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/ipd/${id}/vitals`, data),
    onSuccess: () => { toast.success('Vitals recorded'); qc.invalidateQueries({ queryKey: ['ipd'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useAddNote() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/ipd/${id}/notes`, data),
    onSuccess: () => { toast.success('Note added'); qc.invalidateQueries({ queryKey: ['ipd'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useMarkBedClean() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (bedId) => api.put(`/ipd/beds/${bedId}/clean`),
    onSuccess: () => { toast.success('Bed marked clean'); qc.invalidateQueries({ queryKey: ['ipd'] }); },
    onError: (err) => toast.error(err.message),
  });
}
