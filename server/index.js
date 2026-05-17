import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import routes from './routes/index.js';

// Register all models
import './models/User.js';
import './models/Patient.js';
import './models/Doctor.js';
import './models/Department.js';
import './models/QueueToken.js';
import './models/Appointment.js';
import './models/Billing.js';
import './models/Ward.js';
import './models/Bed.js';
import './models/IPDAdmission.js';
import './models/MedicineMaster.js';
import './models/PharmacyInventory.js';
import './models/Attendance.js';
import './models/Prescription.js';
import './models/LabTest.js';
import './models/LabOrder.js';
import './models/BloodBank.js';
import './models/Ambulance.js';
import './models/OTSurgery.js';
import './models/PurchaseOrder.js';
import './models/Housekeeping.js';
import './models/StaffRoster.js';
import './models/InsuranceClaim.js';
import './models/Mortuary.js';
import './models/Feedback.js';
import './models/NursingMAR.js';
import './models/Allergy.js';
import './models/Vitals.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Handle CORS preflight BEFORE any other middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
