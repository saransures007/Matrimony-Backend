import { z } from 'zod';

export const nextProfilesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(25).default(10),
});

export const swipeActionSchema = z.object({
  targetProfileId: z.string().uuid(),
  action: z.enum(['like', 'reject']),
});

export const profileDetailsParamsSchema = z.object({
  profileId: z.string().uuid(),
});
