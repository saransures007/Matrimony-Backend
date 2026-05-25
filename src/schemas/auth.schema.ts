/**
 * Auth module Zod validation schemas
 * Validates request body, query, and URL params for auth endpoints
 */

import { z } from 'zod';

/** Role enum matching the application's RoleType */
export const RoleTypeSchema = z.enum(['USER', 'ADMIN', 'STAFF']);
export type RoleType = z.infer<typeof RoleTypeSchema>;

/** ================================
 * Sign Up Schema
 * ================================
 */
export const signUpBodySchema = z.object({
  account: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().regex(/^\d{10}$/, { message: 'Phone must be 10 digits' }).optional(),
    password: z
      .string()
      .min(4, { message: 'Password must be at least 8 characters' }) /// need to change for prod 4->8
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
    roles: z.array(RoleTypeSchema).default(['USER']),
    displayName: z.string().min(1).max(100).optional(),
  }),
  profile: z.object({
    fullname: z.string().min(1).max(100),
    profileCreatedFor: z.string().min(1),
    dateOfBirth: z.string().datetime({ local: true }).pipe(z.coerce.date()),
    gender: z.enum(['Male', 'Female', 'Other']),
    maritalStatus: z.enum(['Single', 'Divorced', 'Separated', 'Widowed']),
    religionId: z.number().int().positive().optional(),
    sectId: z.number().int().positive().nullable().optional(),// accepts: number | null | undefined
    casteId: z.number().int().positive().optional(),
    subcasteId: z.number().int().positive().optional(),
    kulamId: z.number().int().positive().optional(),
    motherTongueId: z.number().int().positive().optional(),
    countryId: z.number().int().positive().optional(),
    stateId: z.number().int().positive().optional(),
    cityId: z.number().int().positive().optional(),
    heightId: z.number().int().positive().optional(),
    weight: z.number().positive().optional(),
    educationDegreeId: z.number().int().positive().optional(),
    occupationRoleId: z.number().int().positive().optional(),
    employedInId: z.number().int().positive().optional(),
    expectedSalaryId: z.number().int().positive().optional(),
    aboutMe: z.string().max(2000).optional(),
    matrimonyModeId: z.number().int().positive().optional(),
  }),
});

export type SignUpBody = z.infer<typeof signUpBodySchema>;

/** ================================
 * Login (Password) Schema
 * ================================
 */
export const loginPasswordBodySchema = z.object({
  identifier: z.string().min(1, { message: 'Email or phone is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  role: RoleTypeSchema.default('USER'),
}).refine(
  (data) => {
    const { identifier } = data;
    // Must be either a valid email OR exactly 10 digits (phone)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) || /^\d{10}$/.test(identifier);
  },
  { message: 'Identifier must be a valid email address or 10-digit phone number', path: ['identifier'] }
);

export type LoginPasswordBody = z.infer<typeof loginPasswordBodySchema>;

/** ================================
 * Login (OTP) Schema
 * ================================
 */
export const loginOtpBodySchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone must be 10 digits' }),
  otp: z.string().regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
});

export type LoginOtpBody = z.infer<typeof loginOtpBodySchema>;

/** ================================
 * Request OTP Schema
 * ================================
 */
export const requestOtpBodySchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone must be 10 digits' }),
});

export type RequestOtpBody = z.infer<typeof requestOtpBodySchema>;

/** ================================
 * Verify OTP Schema
 * ================================
 */
export const verifyOtpBodySchema = z.object({
  phone: z.string().regex(/^\d{10}$/, { message: 'Phone must be 10 digits' }),
  otp: z.string().regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
});

export type VerifyOtpBody = z.infer<typeof verifyOtpBodySchema>;

/** ================================
 * Check Availability Query
 * ================================
 */
export const checkAvailabilityQuerySchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10}$/).optional(),
}).refine((data) => data.email || data.phone, {
  message: 'At least one of email or phone must be provided',
});

export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilityQuerySchema>;