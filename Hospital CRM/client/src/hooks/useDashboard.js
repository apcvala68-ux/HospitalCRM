import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats'),
    refetchInterval: 30000,
  });
}

export function useRevenueTrend(days = 30) {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', days],
    queryFn: () => api.get(`/dashboard/revenue-trend?days=${days}`),
  });
}

export function useDoctorPerformance() {
  return useQuery({
    queryKey: ['dashboard', 'doctor-performance'],
    queryFn: () => api.get('/dashboard/doctor-performance'),
  });
}

export function useBedOccupancy() {
  return useQuery({
    queryKey: ['dashboard', 'bed-occupancy'],
    queryFn: () => api.get('/dashboard/bed-occupancy'),
  });
}

export function useMonthlyTrends() {
  return useQuery({
    queryKey: ['dashboard', 'monthly-trends'],
    queryFn: () => api.get('/dashboard/monthly-trends'),
  });
}

export function usePaymentBreakdown() {
  return useQuery({
    queryKey: ['dashboard', 'payment-breakdown'],
    queryFn: () => api.get('/dashboard/payment-breakdown'),
  });
}

export function useDepartmentRevenue() {
  return useQuery({
    queryKey: ['dashboard', 'department-revenue'],
    queryFn: () => api.get('/dashboard/department-revenue'),
  });
}

export function useBillingStatus() {
  return useQuery({
    queryKey: ['dashboard', 'billing-status'],
    queryFn: () => api.get('/dashboard/billing-status'),
  });
}

export function useAvgWaitTime() {
  return useQuery({
    queryKey: ['dashboard', 'avg-wait-time'],
    queryFn: () => api.get('/dashboard/avg-wait-time'),
  });
}
