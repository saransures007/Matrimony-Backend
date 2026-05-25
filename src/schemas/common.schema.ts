/**
 * Common Zod schemas shared across all modules
 * Used as building blocks for more specific schemas
 */

import { z } from 'zod';

/**
 * UUID v4 validation pattern
 */
export const uuidSchema = z.string().uuid({ message: 'Invalid ID format' });

/**
 * Pagination query params schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Sort query params schema
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * ID param schema (used in URL params like /users/:id)
 */
export const idParamSchema = z.object({
  id: uuidSchema,
});

/**
 * Search query schema
 */
export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Custom error class for Zod validation failures
 * Carries formatted issue list for consistent error responses
 */
export class ZodValidationError extends Error {
  public readonly statusCode = 400;
  public readonly issues: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    issues: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ZodValidationError';
    this.issues = issues;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format Zod issues into a flat array of { field, message }
 */
export const formatZodIssues = (
  issues: z.ZodIssue[]
): Array<{ field: string; message: string }> =>
  issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));