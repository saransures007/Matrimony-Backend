/**
 * Global type extensions for Express Request/Response
 * Extends the default Express types to include custom properties
 */

import { IJwtPayload } from '@/modules/auth/auth.interfaces';

declare module 'express-serve-static-core' {
  interface Request {
    /** Authenticated user context from JWT */
    user?: IJwtPayload;

    /** Unique request ID for tracing */
    requestId?: string;

    /** Start timestamp for request duration */
    startTime?: number;
  }

  interface Response {
    /** Send a standardized success response */
    apiSuccess<T>(
      data: T,
      message?: string,
      statusCode?: number
    ): Response;

    /** Send a standardized error response */
    apiError(
      message: string,
      statusCode?: number,
      errors?: unknown
    ): Response;
  }
}