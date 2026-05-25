/**
 * Versioned Route Aggregator — /api/v1/*
 * All application routes mounted here
 */

import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from '@/modules/user/user.routes';
import staticDataRouter from './static-data.routes';
import matchesRouter from './matches.routes';
import mediaRouter from './media.routes';
import swipesRouter from './swipes.routes';
import interestsRouter from './interests.routes';

const router = Router();

// Auth (public + authenticated)
router.use('/auth', authRouter);

// User management
router.use('/users', userRouter);

// Static lookup data (public)
router.use('/common', staticDataRouter);

// Matches
router.use('/matches', matchesRouter);

// Media / profile pictures
router.use('/media', mediaRouter);

// Swipes
router.use('/swipes', swipesRouter);

// Interests
router.use('/interests', interestsRouter);

// Health check at versioned prefix
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is healthy',
    data: { version: '1.0.0', timestamp: new Date().toISOString() },
  });
});

export default router;