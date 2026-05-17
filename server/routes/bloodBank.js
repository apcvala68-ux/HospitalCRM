import { Router } from 'express';
import { list, getById, create, update, inventory, stats } from '../controllers/bloodBankController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/inventory', inventory);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);

export default router;
