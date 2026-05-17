import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => api.get('/departments'),
  });
}

export function useDepartment(id) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => api.get(`/departments/${id}`),
    enabled: !!id,
  });
}
