import { CustomError } from '@/utils/custom-error';
import { verifyJWT } from './jwt.service';
import { JWT_ACCESS_TOKEN_SECRET } from '@/config';
import { NextFunction, Request, Response } from 'express';

const decodeToken = async (header: string | undefined) => {
    if (!header) {
        throw new CustomError('Authorization header missing', 401);
    }

    const token = header.replace('Bearer ', '');
    const payload = await verifyJWT(token, JWT_ACCESS_TOKEN_SECRET as string);

    return payload;
};

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { method, path } = req;

    if (method === 'OPTIONS' || ['/api/auth/signin'].includes(path)) {
        return next();
    }

    try {
        const authHeader =
            req.header('Authorization') || req.header('authorization');
        req.context = await decodeToken(authHeader);
        next();
    } catch (error) {
        next(error);
    }
};


import jwt from 'jsonwebtoken';
import { IAuthRequest, RoleType } from '@/modules/auth/auth.interfaces';


const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticateJWT = (roles?: RoleType[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.account = { accountId: decoded.accountId, roles: [decoded.role], passwordHash: '', isActive: decoded.isActive };
      req.role = decoded.role;

      if (roles && !roles.includes(decoded.role)) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};
