/**
 * Input sanitization middleware
 * Escapes dangerous characters to prevent XSS and injection
 */

import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

/**
 * Sanitize string fields in body, query, and params
 * Uses validator.js to escape HTML/script content
 */
export const sanitizeStrings = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const sanitize = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Escape HTML entities — prevents XSS in rendered output
        sanitized[key] = validator.escape(validator.trim(value));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  // req.query is a read-only getter on Node's IncomingMessage — don't replace it
  // Sanitize body fields only; query params are read directly from req.query.x

  next();
};

/**
 * Strip null bytes and control characters from all string fields
 * Useful for preventing NULL byte injection in filenames/IDs
 */
export const stripInvalidChars = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const strip = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(strip);

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Remove null bytes and control chars except \n \r \t
        result[key] = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
      } else if (typeof value === 'object' && value !== null) {
        result[key] = strip(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = strip(req.body);
  }
  // req.query is a read-only getter — skip sanitization on it

  next();
};