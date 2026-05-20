import { Router } from 'express';
import { list, getById, create, update, cancel, calendarEvents } from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';
import { validateCreate, validateUpdate } from '../validators/appointment.js';

const router = Router();
router.use(protect);

router.get('/calendar', calendarEvents);
router.get('/', list);
router.get('/:id', getById);
router.post('/', validateCreate, create);
router.put('/:id', validateUpdate, update);
router.put('/:id/cancel', cancel);

export default router;
