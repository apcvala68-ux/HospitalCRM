import winston from 'winston';

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? ` ${JSON.stringify(meta, null, 0)}`
      : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  }),
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'hospital-crm' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? jsonFormat : devFormat,
    }),
  ],
});

if (process.env.NODE_ENV === 'production' && process.env.LOG_FILE) {
  logger.add(
    new winston.transports.File({
      filename: process.env.LOG_FILE,
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  );
}

export default logger;
