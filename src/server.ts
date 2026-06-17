/**
 * Production-Grade Server Entry Point
 *
 * Middleware order (important!):
 *   1. Helmet (security headers) — first
 *   2. Trust proxy (for rate limiting behind Cloudflare/load balancers)
 *   3. Request logger (requestId injection)
 *   4. CORS
 *   5. Body parsers
 *   6. Routes (API + static)
 *   7. Not found handler
 *   8. Global error handler — last
 */

import 'dotenv/config';
import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import { config } from 'dotenv';

// App imports
import { PORT, NODE_ENV } from './config';
import { errorHandler, notFoundHandler, asyncWrapper } from './utils/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { defaultLimiter, authLimiter } from './middlewares/rateLimiter';
import { sanitizeStrings, stripInvalidChars } from './middlewares/sanitize';
import { swaggerSpec, swaggerUi, swaggerUiOptions } from './config/swagger';
import router from './routes';
import { DB } from './database';
import { connectRedis, disconnectRedis } from './utils/redis';
import { initRealtime } from './modules/realtime/realtime.service';
import logger from './utils/logger';

// Load .env files
config({ path: `.env.${NODE_ENV ?? 'development'}` });

// ================================
// Express App Setup
// ================================
const app = express();

// ================================
// Security & Trust
// ================================

// Helmet: secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// Trust Cloudflare / load balancer proxy (for correct IP in rate limiting)
app.set('trust proxy', 1);

// ================================
// Global Middleware
// ================================

// 1. Request logging + requestId injection (must be first to wrap everything)
app.use(requestLogger);

// 2. CORS
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '*').split(',');
app.use(cors({
  origin: ALLOWED_ORIGINS.includes('*') ? '*' : ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Global rate limiter (applied to all routes)
app.use(defaultLimiter);

// 5. Input sanitization (XSS prevention)
app.use(sanitizeStrings);
app.use(stripInvalidChars);

// ================================
// Documentation
// ================================

// Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// ================================
// Routes
// ================================

// Health check (no auth, no rate limit)
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  });
});

// Dev/test endpoint
app.get('/test', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hello from production-grade backend!',
    data: { version: '1.0.0', environment: NODE_ENV },
  });
});

// API routes (versioned)
app.use('/api', router);

// ================================
// 404 + Error Handling
// ================================

// 404 — must be before error handler
app.use(notFoundHandler);

// Global error handler — must be LAST
app.use(errorHandler);

// ================================
// Server Lifecycle
// ================================

let server: http.Server;

const startServer = async () => {
  try {
    // Connect to Redis (cache layer)
    await connectRedis();
    logger.info('Redis connected');

    // Connect to DB
    await DB.sequelize.authenticate();
    logger.info('Database connected');

    // Start HTTP server
    server = http.createServer(app);
    await initRealtime(server);
    server.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(
        { port: PORT, env: NODE_ENV, type: 'server_start' },
        `Server running at http://192.168.29.160:${PORT}`
      );
    });

    // server.listen(PORT, () => {
    //   logger.info({ port: PORT, env: NODE_ENV, type: 'server_start' }, `Server running at http://localhost:${PORT}`);
    //   logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
    // });
  } catch (err) {
    logger.error({ err, type: 'startup_failure' }, 'Failed to start server');
    process.exit(1);
  }
};

/**
 * Graceful shutdown — closes DB, Redis, and HTTP server cleanly
 * Handles SIGTERM (Cloudflare) and SIGINT (Ctrl+C)
 */
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal, type: 'graceful_shutdown' }, `Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(() => {
      logger.info({ type: 'http_server_closed' }, 'HTTP server closed');
    });
  }

  try {
    await DB.sequelize.close();
    logger.info('Database connection closed');

    await disconnectRedis();
    logger.info('Redis connection closed');
  } catch (err) {
    logger.error({ err, type: 'shutdown_error' }, 'Error during shutdown');
  }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.fatal({ err, type: 'uncaught_exception' }, 'Uncaught exception!');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, type: 'unhandled_rejection' }, 'Unhandled rejection at:', promise);
});

// ================================
// Start
// ================================
startServer();