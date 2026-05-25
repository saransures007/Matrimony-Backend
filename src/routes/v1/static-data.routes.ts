/**
 * Static Data Routes — /api/v1/common
 * Public endpoint — no auth required (lookup tables for frontend)
 */

import { Router } from 'express';
import { asyncWrapper } from '@/utils/errorHandler';
import { getStaticDataService } from '@/modules/common/static-data/static-data.service';

const router = Router();

router.get('/static-data', asyncWrapper(async (_req, res) => {
  const data = await getStaticDataService();
  res.status(200).json({
    success: true,
    message: 'Static data fetched',
    data,
  });
}));

export default router;