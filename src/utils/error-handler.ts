import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CustomError } from './custom-error';
import logger from './logger';

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isValidationError = err instanceof ZodError;
  const statusCode = isValidationError ? 400 : err instanceof CustomError ? err.statusCode : 500;
  const message = isValidationError ? 'Validation failed' : err.message || 'Internal Server Error';

  // Log the full error stack using Winston
  logger.error(`Error occurred in ${req.method} ${req.url} - ${err.stack || err}`);

  res.status(statusCode).json({
    message,
    error: message,
    ...(isValidationError && { issues: err.issues }),
    // Optional: send stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
