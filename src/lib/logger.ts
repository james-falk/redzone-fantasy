import winston from 'winston';

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'redzone-fantasy' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper functions for common logging patterns
export const logIngestionStart = (sourceId: string, sourceName: string) => {
  logger.info(`Starting ingestion for source: ${sourceName}`, { sourceId, sourceName });
};

export const logIngestionComplete = (
  sourceId: string,
  sourceName: string,
  itemsProcessed: number,
  itemsSaved: number
) => {
  logger.info(`Ingestion completed for source: ${sourceName}`, {
    sourceId,
    sourceName,
    itemsProcessed,
    itemsSaved,
  });
};

export const logIngestionError = (
  sourceId: string,
  sourceName: string,
  error: Error
) => {
  logger.error(`Ingestion failed for source: ${sourceName}`, {
    sourceId,
    sourceName,
    error: error.message,
    stack: error.stack,
  });
};

export const logValidationError = (
  sourceId: string,
  data: unknown,
  validationError: Error
) => {
  logger.warn(`Validation failed for item from source: ${sourceId}`, {
    sourceId,
    data,
    validationError: validationError.message,
  });
};
