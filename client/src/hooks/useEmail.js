import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from './useToast';

export function useEmailProfile() {
  return useQuery({
    queryKey: ['email', 'profile'],
    queryFn: () => api.get('/email/profile'),
  });
}

export function useEmails(label = 'INBOX', maxResults = 20) {
  return useQuery({
    queryKey: ['email', 'list', label, maxResults],
    queryFn: () => api.get(`/email?label=${label}&maxResults=${maxResults}`),
  });
}

export function useEmail(id) {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => api.get(`/email/${id}`),
    enabled: !!id,
  });
}

export function useLabels() {
  return useQuery({
    queryKey: ['email', 'labels'],
    queryFn: () => api.get('/email/labels'),
  });
}

export function useSendEmail() {
  const toast = useToast();
  return useMutation({
    mutationFn: (data) => api.post('/email/send', data),
    onSuccess: () => toast.success('Email sent successfully'),
    onError: (err) => toast.error(err.message),
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/email/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'list'] });
    },
  });
}
