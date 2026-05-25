/**
 * Swipes Routes — /api/v1/swipes
 * Authenticated — swipe on profiles, get next profiles to view
 */

import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { asyncWrapper } from '@/utils/errorHandler';
import { validateQuery, validateParams, validateBody } from '@/middlewares/validateRequest';
import { swipesService } from '@/modules/swipes/swipes.service';
import { z } from 'zod';
import logger from '@/utils/logger';

const router = Router();

router.use(authenticate);

// Zod schemas
const nextProfilesQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const profileDetailsParamsSchema = z.object({
  profileId: z.string().uuid(),
});

const swipeActionSchema = z.object({
  targetProfileId: z.string().uuid(),
  action: z.enum(['like', 'reject']),
});

/** GET /swipes/next — get next profiles to swipe on */
router.get('/next', validateQuery(nextProfilesQuerySchema), asyncWrapper(async (req, res) => {
  const { cursor, limit } = req.query as unknown as z.infer<typeof nextProfilesQuerySchema>;
  const data = await swipesService.nextProfiles(req.user!.accountId, cursor, limit);
  logger.info("next profile"+ JSON.stringify(data))
  res.status(200).json({ success: true, message: 'Next profiles fetched', ...data });
}));

/** GET /swipes/profiles/:profileId — get full profile details */
router.get('/profiles/:profileId', validateParams(profileDetailsParamsSchema), asyncWrapper(async (req, res) => {
  const { profileId } = req.params as unknown as z.infer<typeof profileDetailsParamsSchema>;
  const data = await swipesService.profileDetails(req.user!.accountId, profileId);
  res.status(200).json({ success: true, message: 'Profile fetched', data });
}));

/** POST /swipes — record a swipe (like or reject) */
router.post('/', validateBody(swipeActionSchema), asyncWrapper(async (req, res) => {
  const { targetProfileId, action } = req.body as z.infer<typeof swipeActionSchema>;
  const data = await swipesService.swipe(req.user!.accountId, targetProfileId, action);
  res.status(201).json({ success: true, message: 'Swipe recorded', data });
}));

export default router;