import { Router } from 'express';
import { checkIn, checkOut, todayAttendance, list, markAttendance } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/today', todayAttendance);
router.get('/', authorize('admin'), list);
router.post('/mark', authorize('admin'), markAttendance);

export default router;
