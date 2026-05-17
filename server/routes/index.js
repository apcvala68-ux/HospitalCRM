import { Router } from 'express';
import authRoutes from './auth.js';
import patientRoutes from './patients.js';
import queueRoutes from './queue.js';
import doctorRoutes from './doctors.js';
import prescriptionRoutes from './prescriptions.js';
import labTestRoutes from './labTests.js';
import billingRoutes from './billing.js';
import ipdRoutes from './ipd.js';
import pharmacyRoutes from './pharmacy.js';
import attendanceRoutes from './attendance.js';
import dashboardRoutes from './dashboard.js';
import departmentRoutes from './departments.js';
import appointmentRoutes from './appointments.js';
import labOrderRoutes from './labOrders.js';
import bloodBankRoutes from './bloodBank.js';
import ambulanceRoutes from './ambulance.js';
import otSurgeryRoutes from './otSurgery.js';
import purchaseOrderRoutes from './purchaseOrders.js';
import housekeepingRoutes from './housekeeping.js';
import staffRosterRoutes from './staffRoster.js';
import insuranceClaimRoutes from './insuranceClaims.js';
import mortuaryRoutes from './mortuary.js';
import feedbackRoutes from './feedback.js';
import nursingMARRoutes from './nursingMAR.js';
import allergyRoutes from './allergies.js';
import vitalsRoutes from './vitals.js';
import emailRoutes from './email.js';

const router = Router();

// Health check - no auth required
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HospitalCRM API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/queue', queueRoutes);
router.use('/doctors', doctorRoutes);
router.use('/departments', departmentRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/lab-tests', labTestRoutes);
router.use('/lab-orders', labOrderRoutes);
router.use('/billing', billingRoutes);
router.use('/insurance', insuranceClaimRoutes);
router.use('/ipd', ipdRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/blood-bank', bloodBankRoutes);
router.use('/ambulance', ambulanceRoutes);
router.use('/ot-surgery', otSurgeryRoutes);
router.use('/nursing-mar', nursingMARRoutes);
router.use('/allergies', allergyRoutes);
router.use('/vitals', vitalsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/roster', staffRosterRoutes);
router.use('/housekeeping', housekeepingRoutes);
router.use('/mortuary', mortuaryRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/email', emailRoutes);

export default router;
