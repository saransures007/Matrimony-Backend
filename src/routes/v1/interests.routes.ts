/**
 * Interests Routes — /api/v1/interests
 * Authenticated — received/sent interests, accept/reject, matches
 */

import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { asyncWrapper } from '@/utils/errorHandler';
import { validateQuery, validateParams } from '@/middlewares/validateRequest';
import { interestsService } from '@/modules/interests/interests.service';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

// Zod schemas
const pageQuerySchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const likeIdParamsSchema = z.object({
  likeId: z.coerce.number().int().positive(),
});

/** GET /interests/received — profiles who sent me interests */
router.get('/received', validateQuery(pageQuerySchema), asyncWrapper(async (req, res) => {
  const { cursor, limit } = req.query as unknown as z.infer<typeof pageQuerySchema>;
  const data = await interestsService.received(req.user!.accountId, cursor, limit);
  res.status(200).json({ success: true, message: 'Received interests fetched', ...data });
}));

/** GET /interests/sent — profiles I've sent interests to */
router.get('/sent', validateQuery(pageQuerySchema), asyncWrapper(async (req, res) => {
  const { cursor, limit } = req.query as unknown as z.infer<typeof pageQuerySchema>;
  const data = await interestsService.sent(req.user!.accountId, cursor, limit);
  res.status(200).json({ success: true, message: 'Sent interests fetched', ...data });
}));

/** GET /interests/matches — mutual matches */
router.get('/matches', validateQuery(pageQuerySchema), asyncWrapper(async (req, res) => {
  const { cursor, limit } = req.query as unknown as z.infer<typeof pageQuerySchema>;
  const data = await interestsService.matches(req.user!.accountId, cursor, limit);
  res.status(200).json({ success: true, message: 'Matches fetched', ...data });
}));

/** POST /interests/:likeId/accept — accept an incoming interest */
router.post('/:likeId/accept', validateParams(likeIdParamsSchema), asyncWrapper(async (req, res) => {
  const { likeId } = req.params as unknown as z.infer<typeof likeIdParamsSchema>;
  const data = await interestsService.accept(req.user!.accountId, likeId);
  res.status(200).json({ success: true, message: 'Interest accepted', data });
}));

/** POST /interests/:likeId/reject — reject an incoming interest */
router.post('/:likeId/reject', validateParams(likeIdParamsSchema), asyncWrapper(async (req, res) => {
  const { likeId } = req.params as unknown as z.infer<typeof likeIdParamsSchema>;
  const data = await interestsService.reject(req.user!.accountId, likeId);
  res.status(200).json({ success: true, message: 'Interest rejected', data });
}));

export default router;