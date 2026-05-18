import { Router } from 'express';
import { list, getById, create, update, remove, quickSearch } from '../controllers/patientController.js';
import { fullHistory } from '../controllers/patientHistoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/search', quickSearch);
router.get('/', list);
router.get('/:id', getById);
router.get('/:id/history', fullHistory);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', authorize('admin'), remove);

export default router;
