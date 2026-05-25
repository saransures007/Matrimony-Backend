/**
 * Unit tests: Zod validation schemas
 */

import { ZodValidationError, formatZodIssues } from '@/schemas/common.schema';
import { signUpBodySchema, loginPasswordBodySchema, requestOtpBodySchema } from '@/schemas/auth.schema';

describe('Common Schema', () => {
  describe('formatZodIssues', () => {
    it('should format issues with field path + message', () => {
      const issues = [
        { path: ['body', 'email'], message: 'Invalid email', code: 'invalid', expected: undefined, received: undefined },
        { path: ['body', 'name'], message: 'Required', code: 'invalid', expected: undefined, received: undefined },
      ] as any;
      const formatted = formatZodIssues(issues);
      expect(formatted).toEqual([
        { field: 'body.email', message: 'Invalid email' },
        { field: 'body.name', message: 'Required' },
      ]);
    });
  });
});

describe('Auth Schema', () => {
  describe('signUpBodySchema', () => {
    it('should pass with valid data', () => {
      const valid = {
        account: {
          email: 'test@example.com',
          password: 'Password123',
          roles: ['USER'],
        },
        profile: {
          fullname: 'John Doe',
          profileCreatedFor: 'Self',
          dateOfBirth: '1995-01-15T00:00:00.000Z',
          gender: 'Male',
          maritalStatus: 'Single',
        },
      };
      const result = signUpBodySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const invalid = {
        account: { email: 'not-an-email', password: 'Password123', roles: ['USER'] },
        profile: { fullname: 'John', profileCreatedFor: 'Self', dateOfBirth: '1995-01-15T00:00:00.000Z', gender: 'Male', maritalStatus: 'Single' },
      };
      const result = signUpBodySchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('email');
    });

    it('should fail with weak password', () => {
      const invalid = {
        account: { email: 'test@example.com', password: 'weak', roles: ['USER'] },
        profile: { fullname: 'John', profileCreatedFor: 'Self', dateOfBirth: '1995-01-15T00:00:00.000Z', gender: 'Male', maritalStatus: 'Single' },
      };
      const result = signUpBodySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should fail with missing required profile fields', () => {
      const invalid = {
        account: { email: 'test@example.com', password: 'Password123', roles: ['USER'] },
        profile: { fullname: 'John' },
      };
      const result = signUpBodySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('loginPasswordBodySchema', () => {
    it('should pass with valid identifier + password', () => {
      const valid = { identifier: 'user@example.com', password: 'Password123', role: 'USER' };
      const result = loginPasswordBodySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should fail with empty identifier', () => {
      const result = loginPasswordBodySchema.safeParse({ identifier: '', password: 'Password123' });
      expect(result.success).toBe(false);
    });

    it('should default role to USER', () => {
      const result = loginPasswordBodySchema.safeParse({ identifier: 'user@example.com', password: 'Password123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('USER');
      }
    });
  });

  describe('requestOtpBodySchema', () => {
    it('should pass with valid 10-digit phone', () => {
      const result = requestOtpBodySchema.safeParse({ phone: '9876543210' });
      expect(result.success).toBe(true);
    });

    it('should fail with non-10-digit phone', () => {
      const result = requestOtpBodySchema.safeParse({ phone: '12345' });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('10 digits');
    });
  });
});