import { Router } from 'express';
import { getMyProfile, getById, list, getMyAppointments } from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/me', getMyProfile);
router.get('/my-appointments', getMyAppointments);
router.get('/', list);
router.get('/:id', getById);

export default router;
