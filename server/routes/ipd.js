import { Router } from 'express';
import {
  listWards, getWardBeds, admitPatient, listActive, getById,
  addVitals, addNote, discharge, updateDiet, markBedClean,
} from '../controllers/ipdController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/wards', listWards);
router.get('/wards/:wardId/beds', getWardBeds);
router.post('/admit', admitPatient);
router.get('/active', listActive);
router.get('/:id', getById);
router.post('/:id/vitals', addVitals);
router.post('/:id/notes', addNote);
router.put('/:id/discharge', discharge);
router.put('/:id/diet', updateDiet);
router.put('/beds/:bedId/clean', markBedClean);

export default router;
