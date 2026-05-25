import pino from 'pino';
import { config } from 'dotenv';

// Load env
config();

/**
 * Pino Logger Configuration
 *
 * - Console: human-readable during dev, JSON in production
 * - File: daily-rotated debug + error logs (Cloudflare-safe)
 * - Request context (requestId, userId) injected by middleware
 */

// Resolve LOG_DIR relative to project root
const LOG_DIR = process.env.LOG_DIR ?? './logs';

const targets: pino.LoggerOptions['transport'] = {
  targets: [
    // Debug log (all levels)
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
      level: 'debug',
    },
    // Error-only file
    {
      target: 'pino/file',
      options: {
        destination: `${LOG_DIR}/error.log`,
        mkdir: true,
      },
      level: 'error',
    },
    // Combined file (all levels)
    {
      target: 'pino/file',
      options: {
        destination: `${LOG_DIR}/combined.log`,
        mkdir: true,
      },
      level: 'info',
    },
  ],
};

/**
 * Base logger instance — child loggers inherit request context
 */
const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  ...(process.env.NODE_ENV !== 'production'
    ? { transport: targets }
    : {}),
  // Include pid + hostname in every log line for traceability
  base: { pid: process.pid },
  // Customize timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
  // Redact sensitive fields automatically
  redact: {
    paths: ['req.headers.authorization', 'req.headers["x-api-key"]', 'password', 'token'],
    censor: '[REDACTED]',
  },
});

export default logger;

/**
 * Create a child logger with request-scoped context
 * Usage: const log = createRequestLogger(req);
 */
export const createRequestLogger = (requestId: string, userId?: string) =>
  logger.child({ requestId, userId: userId ?? 'anonymous' });

/**
 * Log HTTP request/response lifecycle
 * Called by requestLogger middleware
 */
export const logRequest = (
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  requestId: string
) => {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level]({
    type: 'http',
    method,
    path,
    statusCode,
    durationMs,
    requestId,
  });
};