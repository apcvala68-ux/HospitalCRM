import { Router } from 'express';
import { list, getById, create, update, handover, issueDeathCertificate, stats } from '../controllers/mortuaryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/:id', getById);
router.post('/', authorize('admin', 'doctor'), create);
router.put('/:id', authorize('admin', 'doctor'), update);
router.put('/:id/handover', authorize('admin', 'doctor'), handover);
router.put('/:id/death-certificate', authorize('admin', 'doctor'), issueDeathCertificate);

export default router;
