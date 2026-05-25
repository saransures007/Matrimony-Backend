/**
 * Integration tests: Auth endpoints
 * Uses mocked authService to avoid DB dependency
 */

import request from 'supertest';
import express from 'express';
import { errorHandler, notFoundHandler } from '@/utils/errorHandler';
import authRouter from '@/routes/v1/auth.routes';

// Mock the auth service so integration tests don't need a real DB
// auth.service exports authService as a NAMED export (not default)
jest.mock('@/modules/auth/auth.service', () => ({
  __esModule: true,
  authService: {
    registerUser: jest.fn().mockResolvedValue({
      accountId: '123e4567-e89b-12d3-a456-426614174000',
      profileId: '223e4567-e89b-12d3-a456-426614174001',
      token: 'mock-jwt-token',
    }),
    loginWithPassword: jest.fn().mockResolvedValue({ token: 'mock-jwt-token' }),
    loginWithOTP: jest.fn().mockResolvedValue({ token: 'mock-jwt-token' }),
    requestLoginOtp: jest.fn().mockResolvedValue({ expiresAt: new Date() }),
    verifyLoginOtp: jest.fn().mockResolvedValue({ token: 'mock-jwt-token', accountId: '123' }),
    checkAvailability: jest.fn().mockResolvedValue({
      email: { available: true },
      phone: { available: true },
    }),
  },
}));

import { authService } from '@/modules/auth/auth.service';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Auth Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/login/password', () => {
    it('should return 400 for missing body', async () => {
      const res = await request(app).post('/api/v1/auth/login/password').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login/password')
        .send({ identifier: 'not-an-email', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 200 and call service with valid data', async () => {
      (authService.loginWithPassword as jest.Mock).mockResolvedValue({ token: 'jwt-token' });

      const res = await request(app)
        .post('/api/v1/auth/login/password')
        .send({ identifier: 'user@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBe('jwt-token');
    });

    it('should accept 10-digit phone as identifier', async () => {
      (authService.loginWithPassword as jest.Mock).mockResolvedValue({ token: 'jwt-token' });

      const res = await request(app)
        .post('/api/v1/auth/login/password')
        .send({ identifier: '9876543210', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/auth/check-availability', () => {
    it('should return 400 when neither email nor phone provided', async () => {
      const res = await request(app).get('/api/v1/auth/check-availability');
      expect(res.status).toBe(400);
    });

    it('should return 200 for valid email', async () => {
      (authService.checkAvailability as jest.Mock).mockResolvedValue({
        email: { available: true },
      });

      const res = await request(app)
        .get('/api/v1/auth/check-availability')
        .query({ email: 'test@example.com' });

      // Inspect the actual response on failure
      if (res.status !== 200) {
        console.log('checkAvailability (email) error:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 200 for valid phone', async () => {
      (authService.checkAvailability as jest.Mock).mockResolvedValue({
        phone: { available: true },
      });

      const res = await request(app)
        .get('/api/v1/auth/check-availability')
        .query({ phone: '9876543210' });

      // Inspect the actual response on failure
      if (res.status !== 200) {
        console.log('checkAvailability (phone) error:', res.body);
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/otp/request', () => {
    it('should return 400 for invalid phone (not 10 digits)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '123' });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 200 with valid 10-digit phone', async () => {
      (authService.requestLoginOtp as jest.Mock).mockResolvedValue({ expiresAt: new Date() });

      const res = await request(app)
        .post('/api/v1/auth/otp/request')
        .send({ phone: '9876543210' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/otp/verify', () => {
    it('should return 400 for invalid OTP format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ phone: '9876543210', otp: '123' });

      expect(res.status).toBe(400);
    });

    it('should return 200 with valid OTP', async () => {
      (authService.verifyLoginOtp as jest.Mock).mockResolvedValue({
        token: 'jwt-token',
        accountId: '123',
      });

      const res = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ phone: '9876543210', otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});