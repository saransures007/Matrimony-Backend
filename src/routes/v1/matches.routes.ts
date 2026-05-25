/**
 * Matches Routes — /api/v1/matches
 * Authenticated — get the current user's matches by matrimony mode
 */

import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { asyncWrapper } from '@/utils/errorHandler';
import { Errors } from '@/utils/AppError';
import { matchesService } from '@/modules/matches/matches.service';

const router = Router();

router.use(authenticate);

router.get('/', asyncWrapper(async (req, res) => {
  const accountId = req.user!.accountId;
  const matches = await matchesService.getMatchesForUser(accountId);

  res.status(200).json({
    success: true,
    message: 'Matches fetched',
    data: matches,
  });
}));

export default router;