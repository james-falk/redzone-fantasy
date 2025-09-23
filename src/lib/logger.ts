import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Detect serverless environment
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

// Create logger instance with appropriate transports
const transports: winston.transport[] = [];

// In serverless environments, only use console logging
if (isServerless) {
  // For serverless, just use console transport
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  );
} else {
  // For local development, use file logging
  const logDir = 'logs';
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    transports.push(
      // Write all logs with importance level of `error` or less to `error.log`
      new winston.transports.File({ 
        filename: path.join(logDir, 'error.log'), 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Write all logs with importance level of `info` or less to `combined.log`
      new winston.transports.File({ 
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  } catch (error) {
    console.warn('Could not set up file logging, falling back to console:', error);
    // Fallback to console if file logging fails
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      })
    );
  }
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'redzone-fantasy' },
  transports,
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
