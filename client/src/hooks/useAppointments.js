import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useAppointments(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => api.get(`/appointments?${qs.toString()}`),
  });
}

export function useCalendarEvents(start, end) {
  return useQuery({
    queryKey: ['appointments', 'calendar', start, end],
    queryFn: () => api.get(`/appointments/calendar?start=${start}&end=${end}`),
    enabled: !!start && !!end,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/appointments', data),
    onSuccess: () => { toast.success('Appointment booked'); qc.invalidateQueries({ queryKey: ['appointments'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id) => api.put(`/appointments/${id}/cancel`),
    onSuccess: () => { toast.success('Appointment cancelled'); qc.invalidateQueries({ queryKey: ['appointments'] }); },
    onError: (err) => toast.error(err.message),
  });
}
