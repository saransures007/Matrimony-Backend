/**
 * Zod validation middleware factory
 * Validates req.body, req.query, or req.params against a Zod schema
 *
 * Usage:
 *   router.post('/users', validateBody(createUserSchema), controller)
 *   router.get('/users', validateQuery(listUsersSchema), controller)
 *   router.get('/users/:id', validateParams(idParamSchema), controller)
 *
 * Combines schemas:
 *   router.put('/users/:id', validateBody(updateSchema), validateParams(idParamSchema), controller)
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { formatZodIssues, ZodValidationError } from '@/schemas/common.schema';
import { Errors } from '@/utils/AppError';

type RequestLocation = 'body' | 'query' | 'params';

/**
 * Create validation middleware for a given Zod schema and location
 */
export const validate = (
  schema: ZodSchema,
  location: RequestLocation = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // In your validation middleware, before Joi runs:
console.log('RAW BODY:', JSON.stringify(req.body, null, 2));
    const data = req[location];

    const result = schema.safeParse(data);

    if (!result.success) {
      const issues = formatZodIssues(result.error.issues);
      return next(new ZodValidationError('Validation failed', issues));
    }

    // Replace raw data with parsed+coerced data (Zod sets defaults, coercer types)
    // Note: req.query is a read-only getter on Express Request — only replace body/params
    if (location !== 'query') {
      req[location] = result.data;
    }

    next();
  };
};

/** Shorthand helpers */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');