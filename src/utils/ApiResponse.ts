/**
 * Standardized API response utilities
 * Ensures every response follows the contract:
 *   { success: boolean, message: string, data?: T }
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response helpers attached to Express Response prototype
 * Usage: res.apiSuccess(data) or res.apiError('Something failed', 400)
 */
export const apiResponseHelpers = {
  /**
   * Send a standardized success response
   */
  apiSuccess<T>(
    this: any,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return this.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>);
  },

  /**
   * Send a standardized error response
   */
  apiError(
    this: any,
    message: string,
    statusCode: number = 500,
    errors?: unknown
  ) {
    return this.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  },
};

/**
 * Standalone helper functions for use outside Express context
 * (e.g., in services or non-request code paths)
 */
export const Response = {
  success<T>(data: T, message = 'Success', meta?: ResponseMeta): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };
  },

  error(message: string, errors?: unknown, meta?: ResponseMeta): ApiResponse {
    return {
      success: false,
      message,
      errors,
      ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } }),
    };
  },

  paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ): ApiResponse<T[]> & { meta: { pagination: PaginationMeta } } {
    return {
      success: true,
      message,
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
      },
    } as ApiResponse<T[]> & { meta: { pagination: PaginationMeta } };
  },
};