import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/auth/login', data),
    onSuccess: (res) => {
      localStorage.setItem('token', res.token);
      queryClient.setQueryData(['auth', 'me'], { user: res.user });
    },
  });
}

export function useGoogleLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/auth/google', data),
    onSuccess: (res) => {
      localStorage.setItem('token', res.token);
      queryClient.setQueryData(['auth', 'me'], { user: res.user });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['auth', 'me'], null);
    queryClient.clear();
  };
}
