/**
 * Unit tests: Auth middleware
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth } from '@/middlewares/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret';

const mockPayload = {
  accountId: '123e4567-e89b-12d3-a456-426614174000',
  role: 'USER' as const,
};

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should call next() with valid Bearer token', () => {
      const token = jwt.sign(mockPayload, JWT_SECRET);
      mockReq.headers = { authorization: `Bearer ${token}` };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toMatchObject(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with 401 when Authorization header is missing', () => {
      mockReq.headers = {};

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should call next with 401 when token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should call next with 401 when token format is wrong', () => {
      mockReq.headers = { authorization: 'Basic some-token' };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('optionalAuth', () => {
    it('should set req.user when token is valid', () => {
      const token = jwt.sign(mockPayload, JWT_SECRET);
      mockReq.headers = { authorization: `Bearer ${token}` };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toMatchObject(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() without setting user when no token', () => {
      mockReq.headers = {};

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next() without setting user when token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid' };

      optionalAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});