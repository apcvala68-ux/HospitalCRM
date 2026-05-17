import { Router } from 'express';
import { list, getById, create, update, remove, byPatient, checkDrug, stats } from '../controllers/allergyController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', list);
router.get('/stats', stats);
router.get('/check-drug', checkDrug);
router.get('/patient/:patientId', byPatient);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
