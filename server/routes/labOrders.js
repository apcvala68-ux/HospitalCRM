import { Router } from 'express';
import { list, getById, create, update, updateStatus, addResult, verify, stats } from '../controllers/labOrderController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/status', updateStatus);
router.put('/:id/result', addResult);
router.put('/:id/verify', verify);

export default router;
