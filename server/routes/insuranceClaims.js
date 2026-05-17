import { Router } from 'express';
import { list, getById, create, update, approve, reject, stats } from '../controllers/insuranceClaimController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/approve', authorize('admin'), approve);
router.put('/:id/reject', authorize('admin'), reject);

export default router;
