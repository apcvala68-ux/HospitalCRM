import { Router } from 'express';
import { list, getById, create, update, bulkCreate, byDate, stats } from '../controllers/staffRosterController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/date/:date', byDate);
router.get('/:id', getById);
router.post('/', authorize('admin'), create);
router.post('/bulk', authorize('admin'), bulkCreate);
router.put('/:id', update);

export default router;
