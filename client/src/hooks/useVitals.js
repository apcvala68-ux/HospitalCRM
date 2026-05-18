import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useVitals(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['vitals', params],
    queryFn: () => api.get(`/vitals?${qs.toString()}`),
  });
}

export function useLatestVitals(patientId) {
  return useQuery({
    queryKey: ['vitals', 'latest', patientId],
    queryFn: () => api.get(`/vitals/patient/${patientId}`),
    enabled: !!patientId,
  });
}

export function useTokenVitals(tokenId) {
  return useQuery({
    queryKey: ['vitals', 'token', tokenId],
    queryFn: () => api.get(`/vitals/token/${tokenId}`),
    enabled: !!tokenId,
  });
}

export function useCreateVitals() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/vitals', data),
    onSuccess: () => {
      toast.success('Vitals recorded');
      qc.invalidateQueries({ queryKey: ['vitals'] });
    },
    onError: (err) => toast.error(err.message),
  });
}
