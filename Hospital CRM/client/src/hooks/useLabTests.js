import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function usePatientLabTests(patientId) {
  return useQuery({
    queryKey: ['labTests', 'patient', patientId],
    queryFn: () => api.get(`/lab-tests/patient/${patientId}`),
    enabled: !!patientId,
  });
}

export function useCreateLabTests() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/lab-tests/batch', data),
    onSuccess: () => {
      toast.success('Lab tests ordered');
      queryClient.invalidateQueries({ queryKey: ['labTests'] });
    },
    onError: (err) => toast.error(err.message),
  });
}
