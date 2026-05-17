import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useTodayAttendance() {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => api.get('/attendance/today'),
    refetchInterval: 30000,
  });
}

export function useAttendanceList(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['attendance', 'list', params],
    queryFn: () => api.get(`/attendance?${qs.toString()}`),
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/attendance/check-in', data),
    onSuccess: () => { toast.success('Checked in'); qc.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: () => api.put('/attendance/check-out'),
    onSuccess: () => { toast.success('Checked out'); qc.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (err) => toast.error(err.message),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/attendance/mark', data),
    onSuccess: () => { toast.success('Attendance marked'); qc.invalidateQueries({ queryKey: ['attendance'] }); },
    onError: (err) => toast.error(err.message),
  });
}
