import { Router } from 'express';
import { stats, revenueTrend, doctorPerformance, bedOccupancy, monthlyTrends, paymentBreakdown, departmentRevenue, billingStatus, avgWaitTime } from '../controllers/dashboardController.js';
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

export default router;
