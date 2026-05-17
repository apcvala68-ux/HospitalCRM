import { Router } from 'express';
import { create, getByPatient, getMyPatientPrescriptions } from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/', authorize('doctor'), create);
router.get('/patient/:patientId', getByPatient);
router.get('/my-patient/:patientId', authorize('doctor'), getMyPatientPrescriptions);

export default router;
