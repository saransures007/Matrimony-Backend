import { Request, Response, NextFunction } from 'express';
import { CustomError } from './custom-error';
import logger from './logger';

export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log the full error stack using Winston
  logger.error(`Error occurred in ${req.method} ${req.url} - ${err.stack || err}`);

  res.status(statusCode).json({
    error: message,
    // Optional: send stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
