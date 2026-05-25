/**
 * Root Route Aggregator
 * Mounts versioned routes under /api/
 */

import { Router } from 'express';
import v1Router from './v1/index';

const router = Router();

// API versions
router.use('/v1', v1Router);

// Root health check (no auth)
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Dev/test endpoint
router.get('/test', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hello from production-grade backend!',
    data: {
      version: '1.0.0',
      environment: process.env.NODE_ENV ?? 'development',
    },
  });
});

export default router;