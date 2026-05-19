import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useDepartments(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => api.get(`/departments?${qs.toString()}`),
  });
}

export function useDepartment(id) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => api.get(`/departments/${id}`),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  const t = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/departments', data),
    onSuccess: () => { t.success('Department created'); qc.invalidateQueries({ queryKey: ['departments'] }); },
    onError: (e) => t.error(e.message),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  const t = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/departments/${id}`, data),
    onSuccess: () => { t.success('Department updated'); qc.invalidateQueries({ queryKey: ['departments'] }); },
    onError: (e) => t.error(e.message),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  const t = useToast();
  return useMutation({
    mutationFn: (id) => api.delete(`/departments/${id}`),
    onSuccess: () => { t.success('Department deleted'); qc.invalidateQueries({ queryKey: ['departments'] }); },
    onError: (e) => t.error(e.message),
  });
}

export function useAssignDoctor() {
  const qc = useQueryClient();
  const t = useToast();
  return useMutation({
    mutationFn: ({ departmentId, doctorId }) => api.put(`/departments/${departmentId}/assign-doctor`, { doctorId }),
    onSuccess: () => { t.success('Doctor assigned'); qc.invalidateQueries({ queryKey: ['departments'] }); },
    onError: (e) => t.error(e.message),
  });
}

export function useRemoveDoctor() {
  const qc = useQueryClient();
  const t = useToast();
  return useMutation({
    mutationFn: ({ departmentId, doctorId }) => api.put(`/departments/${departmentId}/remove-doctor`, { doctorId }),
    onSuccess: () => { t.success('Doctor removed'); qc.invalidateQueries({ queryKey: ['departments'] }); },
    onError: (e) => t.error(e.message),
  });
}
