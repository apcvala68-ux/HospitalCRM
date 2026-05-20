import { Router } from 'express';
import {
  generateToken,
  getCurrentQueue,
  getNextPatient,
  getTodayHistory,
  callPatient,
  startConsultation,
  completePatient,
  markNoShow,
} from '../controllers/queueController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/generate', generateToken);
router.get('/current/:doctorId', getCurrentQueue);
router.get('/next/:doctorId', getNextPatient);
router.get('/history/:doctorId', getTodayHistory);
router.put('/:id/call', callPatient);
router.put('/:id/start', startConsultation);
router.put('/:id/complete', completePatient);
router.put('/:id/no-show', markNoShow);

export default router;
