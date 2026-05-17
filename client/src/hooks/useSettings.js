import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put('/auth/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data) => api.put('/auth/change-password', data),
  });
}
