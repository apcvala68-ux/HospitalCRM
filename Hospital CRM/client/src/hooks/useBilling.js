import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useBillingList(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['billing', 'list', params],
    queryFn: () => api.get(`/billing?${qs.toString()}`),
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: ['billing', id],
    queryFn: () => api.get(`/billing/${id}`),
    enabled: !!id,
  });
}

export function usePatientBills(patientId) {
  return useQuery({
    queryKey: ['billing', 'patient', patientId],
    queryFn: () => api.get(`/billing/patient/${patientId}`),
    enabled: !!patientId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/billing', data),
    onSuccess: () => {
      toast.success('Invoice created');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/billing/${id}/pay`, data),
    onSuccess: () => {
      toast.success('Payment recorded');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useEODReport(date) {
  const qs = date ? `?date=${date}` : '';
  return useQuery({
    queryKey: ['billing', 'eod', date],
    queryFn: () => api.get(`/billing/eod${qs}`),
  });
}
