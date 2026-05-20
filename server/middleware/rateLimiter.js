import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,          // 15 minutes
  max: isDev ? 10_000 : 2_000,       // dev: unlimited-ish; prod: 2000 req/IP/15min
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,                  // completely skip in development
  message: { message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 30,             // 30 login attempts per 15min in production
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,                  // completely skip in development
  message: { message: 'Too many login attempts, please try again later.' },
});
