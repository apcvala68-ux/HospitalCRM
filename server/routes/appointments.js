import { Router } from 'express';
import { list, getById, create, update, cancel, calendarEvents } from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/calendar', calendarEvents);
router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/cancel', cancel);

export default router;
