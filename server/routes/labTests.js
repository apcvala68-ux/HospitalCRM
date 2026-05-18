import { Router } from 'express';
import { create, createBatch, getByPatient, updateStatus } from '../controllers/labTestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', authorize('doctor'), create);
router.post('/batch', authorize('doctor'), createBatch);
router.get('/patient/:patientId', getByPatient);
router.put('/:id/status', updateStatus);

export default router;
