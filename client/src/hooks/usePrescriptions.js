import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function usePatientPrescriptions(patientId) {
  return useQuery({
    queryKey: ['prescriptions', 'patient', patientId],
    queryFn: () => api.get(`/prescriptions/patient/${patientId}`),
    enabled: !!patientId,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/prescriptions', data),
    onSuccess: () => {
      toast.success('Prescription saved');
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
    onError: (err) => toast.error(err.message),
  });
}
