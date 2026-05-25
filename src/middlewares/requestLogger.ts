/**
 * Request logging middleware — Pine-based
 * Injects requestId, measures duration, and logs every request/response
 */

import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import logger, { logRequest } from '@/utils/logger';

/**
 * Attaches requestId to every request and logs on response finish
 * Must be registered FIRST among all middleware so it wraps everything
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
  const startTime = Date.now();

  // Attach to request for downstream access
  req.requestId = requestId;
  req.startTime = startTime;

  // Always attach requestId header to response for client correlation
  res.setHeader('X-Request-Id', requestId);

  // Log when response finishes
  res.on('finish', () => {
    logRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      Date.now() - startTime,
      requestId
    );
  });

  next();
};