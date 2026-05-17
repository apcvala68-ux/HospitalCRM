import { Router } from 'express';
import {
  stats, revenueTrend, doctorPerformance, bedOccupancy, monthlyTrends,
  paymentBreakdown, departmentRevenue, billingStatus, avgWaitTime,
  todayAppointments, patientStats, patientVisitsGauge, doctorsAvailability,
  latestAppointments, patientRecords, recentLabResults, quickStats,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/stats', stats);
router.get('/revenue-trend', revenueTrend);
router.get('/doctor-performance', doctorPerformance);
router.get('/bed-occupancy', bedOccupancy);
router.get('/monthly-trends', monthlyTrends);
router.get('/payment-breakdown', paymentBreakdown);
router.get('/department-revenue', departmentRevenue);
router.get('/billing-status', billingStatus);
router.get('/avg-wait-time', avgWaitTime);
router.get('/today-appointments', todayAppointments);
router.get('/patient-stats', patientStats);
router.get('/patient-visits-gauge', patientVisitsGauge);
router.get('/doctors-availability', doctorsAvailability);
router.get('/latest-appointments', latestAppointments);
router.get('/patient-records', patientRecords);
router.get('/recent-lab-results', recentLabResults);
router.get('/quick-stats', quickStats);

export default router;
