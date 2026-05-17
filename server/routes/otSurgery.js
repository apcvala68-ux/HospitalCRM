import { Router } from 'express';
import { list, getById, create, update, updateStatus, otSchedule, stats } from '../controllers/otSurgeryController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/schedule', otSchedule);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/status', updateStatus);

export default router;
