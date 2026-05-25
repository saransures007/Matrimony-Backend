/**
 * Auth Routes — /api/v1/auth
 * Public routes: register, login, OTP flows
 * Protected routes: logout, refresh token
 */

import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { validateBody, validateQuery } from '@/middlewares/validateRequest';
import {
  signUpBodySchema,
  loginPasswordBodySchema,
  loginOtpBodySchema,
  requestOtpBodySchema,
  verifyOtpBodySchema,
  checkAvailabilityQuerySchema,
} from '@/schemas/auth.schema';
import { asyncWrapper } from '@/utils/errorHandler';
import { authService } from '@/modules/auth/auth.service';
import { authLimiter, otpVerifyLimiter, sensitiveLimiter } from '@/middlewares/rateLimiter';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Create a new user account + profile
 */
router.post(
  '/register',
  authLimiter,
  validateBody(signUpBodySchema),
  asyncWrapper(async (req, res) => {
    const { account, profile } = req.body;
    const result = await authService.registerUser(account, profile);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/login/password
 * Login with email/phone + password
 */
router.post(
  '/login/password',
  authLimiter,
  validateBody(loginPasswordBodySchema),
  asyncWrapper(async (req, res) => {
    const { identifier, password, role } = req.body;
    const result = await authService.loginWithPassword(identifier, password, role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/login/otp
 * Login with phone + OTP
 */
router.post(
  '/login/otp',
  authLimiter,
  validateBody(loginOtpBodySchema),
  asyncWrapper(async (req, res) => {
    const { phone, otp } = req.body;
    const result = await authService.loginWithOTP(phone, otp);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * GET /api/v1/auth/check-availability
 * Check if email or phone is already taken
 */
router.get(
  '/check-availability',
  validateQuery(checkAvailabilityQuerySchema),
  asyncWrapper(async (req, res) => {
    const { email, phone } = req.query as any;
    const result = await authService.checkAvailability(email, phone);

    res.status(200).json({
      success: true,
      message: 'Availability checked',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/otp/request
 * Request a login OTP (sent via SMS)
 */
router.post(
  '/otp/request',
  sensitiveLimiter,
  validateBody(requestOtpBodySchema),
  asyncWrapper(async (req, res) => {
    const { phone } = req.body;
    const result = await authService.requestLoginOtp(phone);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/otp/verify
 * Verify OTP and complete login
 */
router.post(
  '/otp/verify',
  otpVerifyLimiter,
  validateBody(verifyOtpBodySchema),
  asyncWrapper(async (req, res) => {
    const { phone, otp } = req.body;
    const result = await authService.verifyLoginOtp(phone, otp);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  })
);

/**
 * POST /api/v1/auth/logout
 * Invalidate session (client-side token discard)
 */
router.post(
  '/logout',
  authenticate,
  asyncWrapper(async (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  })
);

export default router;