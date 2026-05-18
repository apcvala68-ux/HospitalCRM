import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

// Helper to build query strings
const buildQuery = (dateRange) => {
  if (!dateRange || !dateRange.start || !dateRange.end) return '';
  const startStr = dateRange.start.toString(); // format depends on CalendarDate
  const endStr = dateRange.end.toString();
  return `?startDate=${startStr}&endDate=${endStr}`;
};

export function useDashboardStats(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'stats', queryStr],
    queryFn: () => api.get(`/dashboard/stats${queryStr}`),
    refetchInterval: 30000,
  });
}

export function useRevenueTrend(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'revenue-trend', queryStr],
    queryFn: () => api.get(`/dashboard/revenue-trend${queryStr}`),
  });
}

export function useDoctorPerformance(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'doctor-performance', queryStr],
    queryFn: () => api.get(`/dashboard/doctor-performance${queryStr}`),
  });
}

export function useBedOccupancy(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'bed-occupancy', queryStr],
    queryFn: () => api.get(`/dashboard/bed-occupancy${queryStr}`),
  });
}

export function useMonthlyTrends(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'monthly-trends', queryStr],
    queryFn: () => api.get(`/dashboard/monthly-trends${queryStr}`),
  });
}

export function usePaymentBreakdown(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'payment-breakdown', queryStr],
    queryFn: () => api.get(`/dashboard/payment-breakdown${queryStr}`),
  });
}

export function useDepartmentRevenue(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'department-revenue', queryStr],
    queryFn: () => api.get(`/dashboard/department-revenue${queryStr}`),
  });
}

export function useBillingStatus(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'billing-status', queryStr],
    queryFn: () => api.get(`/dashboard/billing-status${queryStr}`),
  });
}

export function useAvgWaitTime(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'avg-wait-time', queryStr],
    queryFn: () => api.get(`/dashboard/avg-wait-time${queryStr}`),
  });
}

export function useTodayAppointments(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'today-appointments', queryStr],
    queryFn: () => api.get(`/dashboard/today-appointments${queryStr}`),
    refetchInterval: 30000,
  });
}

export function usePatientStats(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'patient-stats', queryStr],
    queryFn: () => api.get(`/dashboard/patient-stats${queryStr}`),
  });
}

export function usePatientVisitsGauge(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'patient-visits-gauge', queryStr],
    queryFn: () => api.get(`/dashboard/patient-visits-gauge${queryStr}`),
  });
}

export function useDoctorsAvailability(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'doctors-availability', queryStr],
    queryFn: () => api.get(`/dashboard/doctors-availability${queryStr}`),
  });
}

export function useLatestAppointments(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'latest-appointments', queryStr],
    queryFn: () => api.get(`/dashboard/latest-appointments${queryStr}`),
  });
}

export function usePatientRecords(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'patient-records', queryStr],
    queryFn: () => api.get(`/dashboard/patient-records${queryStr}`),
  });
}

export function useRecentLabResults(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'recent-lab-results', queryStr],
    queryFn: () => api.get(`/dashboard/recent-lab-results${queryStr}`),
  });
}

export function useQuickStats(dateRange) {
  const queryStr = buildQuery(dateRange);
  return useQuery({
    queryKey: ['dashboard', 'quick-stats', queryStr],
    queryFn: () => api.get(`/dashboard/quick-stats${queryStr}`),
    refetchInterval: 30000,
  });
}
