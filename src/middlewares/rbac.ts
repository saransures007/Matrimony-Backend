/**
 * Role-Based Access Control (RBAC) middleware
 * Works in tandem with authenticate middleware (must run after it)
 *
 * Usage:
 *   router.delete('/admin/users', authenticate, authorize('ADMIN'), handler)
 *   router.get('/profile', authenticate, authorize('USER', 'ADMIN'), handler)
 */

import { Request, Response, NextFunction } from 'express';
import { RoleType } from '@/modules/auth/auth.interfaces';
import { Errors } from '@/utils/AppError';

/**
 * Creates RBAC middleware that permits only the specified roles
 * @param allowedRoles — roles that are allowed to access the route
 */
export const authorize = (...allowedRoles: RoleType[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(Errors.unauthorized('Authentication required'));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(Errors.forbidden(`Access denied — requires one of: ${allowedRoles.join(', ')}`));
    }

    next();
  };
};

/**
 * Shorthand middlewares for common role checks
 */
export const isAdmin = authorize('ADMIN');
export const isStaff = authorize('ADMIN', 'STAFF');
export const isUser = authorize('USER');
export const isAdminOrOwner = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) return next(Errors.unauthorized('Authentication required'));

  const userRole = req.user.role;
  const isOwner = req.params.id === req.user.accountId;

  if (userRole === 'ADMIN' || isOwner) {
    return next();
  }

  return next(Errors.forbidden('You can only access your own resource or must be an admin'));
};