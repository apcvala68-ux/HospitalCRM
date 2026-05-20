import { Router } from 'express';
import { list, getById, create, update, receive, vendorList, stats } from '../controllers/purchaseOrderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/vendors', vendorList);
router.get('/:id', getById);
router.post('/', authorize('admin', 'pharmacist'), create);
router.put('/:id', authorize('admin', 'pharmacist'), update);
router.put('/:id/receive', authorize('admin', 'pharmacist'), receive);

export default router;
