import 'dotenv/config';
import './config/validateEnv.js';
import * as Sentry from '@sentry/node';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import routes from './routes/index.js';
import { generalLimiter } from './middleware/rateLimiter.js';

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

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*.googleusercontent.com'],
      connectSrc: ["'self'", 'https://accounts.google.com', 'https://www.googleapis.com'],
      frameSrc: ["'self'", 'https://accounts.google.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS with whitelist
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// General rate limiter
app.use('/api', generalLimiter);

app.use('/api', routes);

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next(err);
});

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} ${err.status || 500}`, {
    error: err.message,
    stack: err.stack,
    userId: req.user?._id,
    ip: req.ip,
  });
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION', { error: err.message, stack: err.stack });
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION', { error: err.message, stack: err.stack });
  process.exit(1);
});

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
