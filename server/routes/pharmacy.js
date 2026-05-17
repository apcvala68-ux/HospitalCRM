import { Router } from 'express';
import { listMedicines, createMedicine, listInventory, addStock, dispense, lowStockAlerts } from '../controllers/pharmacyController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/medicines', listMedicines);
router.post('/medicines', createMedicine);
router.get('/inventory', listInventory);
router.post('/inventory', addStock);
router.put('/inventory/:id/dispense', dispense);
router.get('/low-stock', lowStockAlerts);

export default router;
