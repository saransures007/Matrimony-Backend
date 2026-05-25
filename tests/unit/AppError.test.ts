/**
 * Unit tests: AppError class and Errors factory
 */

import { AppError, Errors } from '@/utils/AppError';

describe('AppError', () => {
  it('should create error with correct statusCode', () => {
    const err = new AppError('Not found', 404);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.isOperational).toBe(true);
  });

  it('should capture stack trace', () => {
    const err = new AppError('Bad input', 400);
    expect(err.stack).toBeDefined();
  });

  it('should include errors metadata', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = new AppError('Validation failed', 422, true, details);
    expect(err.errors).toEqual(details);
  });

  it('should default to non-operational for 500', () => {
    const err = new AppError('Server error', 500, false);
    expect(err.isOperational).toBe(false);
  });
});

describe('Errors factory', () => {
  it('badRequest', () => {
    const err = Errors.badRequest('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
  });

  it('unauthorized', () => {
    const err = Errors.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });

  it('forbidden', () => {
    const err = Errors.forbidden();
    expect(err.statusCode).toBe(403);
  });

  it('notFound', () => {
    const err = Errors.notFound('User');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
  });

  it('conflict', () => {
    const err = Errors.conflict('Email already in use');
    expect(err.statusCode).toBe(409);
  });

  it('tooManyRequests', () => {
    const err = Errors.tooManyRequests();
    expect(err.statusCode).toBe(429);
  });

  it('internal', () => {
    const err = Errors.internal();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });
});