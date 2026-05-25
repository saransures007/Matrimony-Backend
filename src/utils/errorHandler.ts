import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, Errors } from './AppError';
import logger from './logger';
import { ZodValidationError } from '@/schemas/common.schema';

/**
 * Global error handler middleware
 * Must be registered last — after all routes and other middleware
 *
 * Error priority:
 * 1. AppError           → use its statusCode + message
 * 2. ZodError           → 400 with formatted issues
 * 3. Unknown/Otherwise  → 500 Internal Server Error
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.requestId ?? 'unknown';

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formatted = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    logger.warn({
      type: 'validation_error',
      requestId,
      path: req.path,
      method: req.method,
      issues: formatted,
    });

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
      requestId,
    });
    return;
  }

  // Handle custom validation errors from Zod schemas
  if (err instanceof ZodValidationError) {
    logger.warn({
      type: 'validation_error',
      requestId,
      path: req.path,
      method: req.method,
      issues: err.issues,
    });

    res.status(400).json({
      success: false,
      message: err.message || 'Validation failed',
      errors: err.issues,
      requestId,
    });
    return;
  }

  // Handle AppError (custom application errors)
  if (err instanceof AppError) {
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn';

    logger[logLevel]({
      type: 'app_error',
      requestId,
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      isOperational: err.isOperational,
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? undefined,
      requestId,
    });
    return;
  }

  // Unknown/uncaught errors — always log as error, never expose details in production
  logger.error({
    type: 'unhandled_error',
    requestId,
    path: req.path,
    method: req.method,
    message: err.message,
    stack: err.stack,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.status(500).json({
    success: false,
    message: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
    requestId,
  });
};

/**
 * 404 handler — catches requests that reached no route
 * Registers BEFORE errorHandler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.requestId,
  });
};

/**
 * Async wrapper — wraps async route handlers to catch promise rejections
 * Usage: router.get('/path', asyncWrapper(controllerFn))
 */
export const asyncWrapper = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};