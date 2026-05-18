import { Router } from 'express';
import { list, create, latestByPatient, byToken } from '../controllers/vitalsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/patient/:patientId', latestByPatient);
router.get('/token/:tokenId', byToken);
router.post('/', create);

export default router;
