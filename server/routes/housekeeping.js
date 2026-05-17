import { Router } from 'express';
import { list, getById, create, update, assign, stats } from '../controllers/housekeepingController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/assign', assign);

export default router;
