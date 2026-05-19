import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useMedicines(search) {
  return useQuery({
    queryKey: ['pharmacy', 'medicines', search],
    queryFn: () => api.get(`/pharmacy/medicines${search ? `?search=${search}` : ''}`),
  });
}

export function useInventory(filters = {}) {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['pharmacy', 'inventory', filters],
    queryFn: () => api.get(`/pharmacy/inventory?${qs.toString()}`),
  });
}

export function useAddStock() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/pharmacy/inventory', data),
    onSuccess: () => { toast.success('Stock added'); qc.invalidateQueries({ queryKey: ['pharmacy'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useDispense() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/pharmacy/inventory/${id}/dispense`, data),
    onSuccess: () => { toast.success('Dispensed'); qc.invalidateQueries({ queryKey: ['pharmacy'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useLowStockAlerts() {
  return useQuery({
    queryKey: ['pharmacy', 'low-stock'],
    queryFn: () => api.get('/pharmacy/low-stock'),
    refetchInterval: 60000,
  });
}

export function useCreateMedicine() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/pharmacy/medicines', data),
    onSuccess: () => { toast.success('Medicine added'); qc.invalidateQueries({ queryKey: ['pharmacy'] }); },
    onError: (err) => toast.error(err.message),
  });
}
