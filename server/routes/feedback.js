import { Router } from 'express';
import { list, getById, create, update, resolve, stats } from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/resolve', resolve);

export default router;
