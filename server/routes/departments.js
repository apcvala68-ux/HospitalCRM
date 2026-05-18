import { Router } from 'express';
import { list, getById, create, update, remove } from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/:id', getById);
router.post('/', authorize('admin'), create);
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
