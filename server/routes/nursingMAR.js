import { Router } from 'express';
import { list, getById, create, update, administer, discontinue, byPatient, stats } from '../controllers/nursingMARController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/patient/:patientId', byPatient);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.put('/:id/administer', administer);
router.put('/:id/discontinue', discontinue);

export default router;
