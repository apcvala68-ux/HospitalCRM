import { Router } from 'express';
import { list, getById, getByPatient, create, addPayment, cancelInvoice, eodReport } from '../controllers/billingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/eod', authorize('admin', 'cashier'), eodReport);
router.get('/patient/:patientId', getByPatient);
router.get('/', list);
router.get('/:id', getById);
router.post('/', authorize('admin', 'cashier'), create);
router.post('/:id/pay', authorize('admin', 'cashier'), addPayment);
router.put('/:id/cancel', authorize('admin'), cancelInvoice);

export default router;
