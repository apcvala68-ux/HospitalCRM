import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useCurrentQueue(doctorId) {
  return useQuery({
    queryKey: ['queue', 'current', doctorId],
    queryFn: () => api.get(`/queue/current/${doctorId}`),
    enabled: !!doctorId,
    refetchInterval: 10000,
  });
}

export function useNextPatient(doctorId) {
  return useQuery({
    queryKey: ['queue', 'next', doctorId],
    queryFn: () => api.get(`/queue/next/${doctorId}`),
    enabled: !!doctorId,
    refetchInterval: 10000,
  });
}

export function useQueueHistory(doctorId) {
  return useQuery({
    queryKey: ['queue', 'history', doctorId],
    queryFn: () => api.get(`/queue/history/${doctorId}`),
    enabled: !!doctorId,
  });
}

export function useGenerateToken() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/queue/generate', data),
    onSuccess: (res) => {
      toast.success(`Token #${res.token.tokenNo} generated`);
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useCallPatient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => api.put(`/queue/${id}/call`),
    onSuccess: () => {
      toast.success('Patient called');
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useStartConsultation() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => api.put(`/queue/${id}/start`),
    onSuccess: (res) => {
      toast.success(`Consulting ${res.token.patient?.firstName}`);
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useCompletePatient() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, prescriptionData }) => api.put(`/queue/${id}/complete`, { prescriptionData }),
    onSuccess: (res) => {
      toast.success('Consultation completed');
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (err) => toast.error(err.message),
  });
}
