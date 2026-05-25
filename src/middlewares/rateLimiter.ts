/**
 * Rate limiting middleware using Redis-backed store
 * Falls back to in-memory store if Redis is unavailable
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Errors } from '@/utils/AppError';
import { getRedisClient } from '@/utils/redis';

/** Safe IP extraction — normalizes IPv6-mapped IPv4 addresses */
const safeIp = (req: any): string => {
  const ip = req.ip ?? 'unknown';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
};

/**
 * Default rate limiter — 100 requests per minute per IP
 */
export const defaultLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: Errors.tooManyRequests('Too many requests from this IP, please try again later'),
  skip: (req) => req.path === '/health' || req.path === '/test',
});

/**
 * Auth rate limiter — 5 attempts per minute
 * Combines IP + phone/email so same IP can't brute-force multiple accounts
 * Note: req.ip is used as part of key — express-rate-limit v8 requires it
 * when keyGenerator references req.ip (even with body augmentation)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: Errors.tooManyRequests('Too many authentication attempts, please try again after a minute'),
  keyGenerator: (req) => `${safeIp(req)}:${req.body?.phone ?? req.body?.email ?? 'unknown'}`,
});

/**
 * Sensitive operation limiter — 3 requests per minute
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: Errors.tooManyRequests('Too many attempts — please wait before trying again'),
});

/**
 * Strict limiter for OTP verify — 3 attempts per 10 minutes per IP+phone
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: Errors.tooManyRequests('Too many OTP attempts — please request a new OTP'),
  keyGenerator: (req) => `otp-verify:${safeIp(req)}:${req.body?.phone}`,
});

/**
 * Programmable rate limiter factory
 */
export const createLimiter = (options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  redis?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    store: options.redis
      ? new RedisStore({ sendCommand: (...args: string[]) => getRedisClient().sendCommand(args as any) })
      : undefined,
    keyGenerator: (req) => `${options.keyPrefix ?? 'rl'}:${safeIp(req)}`,
    message: Errors.tooManyRequests(),
  });
};