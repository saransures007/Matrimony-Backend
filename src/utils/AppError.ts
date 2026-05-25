/**
 * Application Error class
 * Extends native Error with HTTP status codes and optional metadata
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Capture proper stack trace (V8 engine)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory methods for common error types
 * Use these instead of `new AppError()` for semantic clarity
 */
export const Errors = {
  /** 400 Bad Request — client sent invalid data */
  badRequest: (message: string, errors?: unknown) =>
    new AppError(message, 400, true, errors),

  /** 401 Unauthorized — missing or invalid credentials */
  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(message, 401, true),

  /** 403 Forbidden — authenticated but not allowed */
  forbidden: (message: string = 'Forbidden') =>
    new AppError(message, 403, true),

  /** 404 Not Found */
  notFound: (resource: string = 'Resource') =>
    new AppError(`${resource} not found`, 404, true),

  /** 409 Conflict — duplicate resource */
  conflict: (message: string) =>
    new AppError(message, 409, true),

  /** 422 Unprocessable Entity — semantic validation failure */
  unprocessable: (message: string, errors?: unknown) =>
    new AppError(message, 422, true, errors),

  /** 429 Too Many Requests */
  tooManyRequests: (message: string = 'Too many requests, please try again later') =>
    new AppError(message, 429, true),

  /** 500 Internal Server Error — unexpected failures */
  internal: (message: string = 'Internal server error') =>
    new AppError(message, 500, false),
} as const;