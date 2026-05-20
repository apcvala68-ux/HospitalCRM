import logger from './logger.js';

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
];

const DEFAULTS = {
  JWT_SECRET: {
    value: 'hospital-crm-jwt-secret-change-in-production',
    message: 'JWT_SECRET is still the default value. Change it immediately in production.',
  },
};

export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const name of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  for (const [name, { value, message }] of Object.entries(DEFAULTS)) {
    if (process.env[name] === value) {
      warnings.push(message);
    }
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    process.exit(1);
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => logger.warn(w));
  }

  logger.info('Environment validated');
}
