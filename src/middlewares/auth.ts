/**
 * JWT Authentication middleware
 * Verifies Bearer token and attaches user payload to req.user
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Errors } from '@/utils/AppError';
import { IJwtPayload } from '@/modules/auth/auth.interfaces';

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret';

/**
 * Authenticate incoming request via JWT Bearer token
 * Sets req.user on success; throws AppError(401) on failure
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization ?? req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw Errors.unauthorized('Authorization header is required');
    }

    // Expect: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw Errors.unauthorized('Authorization header must be: Bearer <token>');
    }

    const token = parts[1];

    try {
      const payload = jwt.verify(token, JWT_SECRET) as IJwtPayload & { userId?: string };
      req.user = {
        accountId: payload.accountId ?? payload.userId ?? '',
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp,
      };
      next();
    } catch {
      throw Errors.unauthorized('Invalid or expired token');
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Optional authentication — sets req.user if token present, but doesn't fail
 * Useful for routes that behave differently for auth vs guest users
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization ?? req.headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return next();
  }

  try {
    const payload = jwt.verify(parts[1], JWT_SECRET) as IJwtPayload;
    req.user = payload;
  } catch {
    // Silently ignore — optional auth
  }

  next();
};
