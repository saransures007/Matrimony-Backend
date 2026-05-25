/**
 * Media Routes — /api/v1/media
 * Authenticated — R2/Cloudflare presigned upload + profile picture management
 */

import { Router, type Request } from 'express';
import { authenticate } from '@/middlewares/auth';
import { asyncWrapper } from '@/utils/errorHandler';
import { Errors } from '@/utils/AppError';
import { mediaService } from '@/modules/media/media.service';
import { validateBody } from '@/middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

// All media routes require auth
router.use(authenticate);

const resolveAccountId = (req: Request): string => {
  const payload = req.user as { accountId?: string } | undefined;
  const account = (req as Request & { account?: { accountId?: string } }).account;
  const context = (req as Request & { context?: { accountId?: string } }).context;
  const accountId = payload?.accountId ?? account?.accountId ?? context?.accountId;
  if (!accountId) throw Errors.unauthorized('Authentication required');
  return accountId;
};

// Zod schemas for media operations
const presignBodySchema = z.object({
  files: z.array(z.object({
    fileName: z.string().min(1).max(255),
    contentType: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    sizeBytes: z.number().int().positive().max(8 * 1024 * 1024),
    sortOrder: z.number().int().optional(),
    isProfilePic: z.boolean().optional(),
  })).min(1).max(10),
});

const completeBodySchema = z.object({
  uploads: z.array(z.object({
    uploadId: z.string().uuid(),
    storageKey: z.string().min(1),
    publicUrl: z.string().url(),
    fileName: z.string().min(1).max(255),
    contentType: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    sizeBytes: z.number().int().positive().max(8 * 1024 * 1024),
    sortOrder: z.number().int().optional(),
    isProfilePic: z.boolean().optional(),
  })).min(1).max(10),
});

const rollbackBodySchema = z.object({
  storageKeys: z.array(z.string()).min(1).max(50),
});

const verifySubmitBodySchema = z.object({
  primaryPictureId: z.number().int().positive().optional(),
});

/** GET /media/profile-pictures — list current user's profile pictures */
router.get('/profile-pictures', asyncWrapper(async (req, res) => {
  const data = await mediaService.listProfilePictures(resolveAccountId(req));
  res.status(200).json({ success: true, message: 'Profile pictures fetched', data });
}));

/** POST /media/profile-pictures/presign — get presigned R2 upload URLs */
router.post('/profile-pictures/presign', validateBody(presignBodySchema), asyncWrapper(async (req, res) => {
  const data = await mediaService.presignProfilePictures(resolveAccountId(req), req.body.files);
  res.status(201).json({ success: true, message: 'Upload URLs created', data });
}));

/** POST /media/profile-pictures/complete — mark uploads as complete in DB */
router.post('/profile-pictures/complete', validateBody(completeBodySchema), asyncWrapper(async (req, res) => {
  const data = await mediaService.completeProfilePictures(resolveAccountId(req), req.body.uploads);
  res.status(201).json({ success: true, message: 'Profile pictures saved', data });
}));

/** POST /media/profile-pictures/rollback — delete failed/partial uploads from R2 */
router.post('/profile-pictures/rollback', validateBody(rollbackBodySchema), asyncWrapper(async (req, res) => {
  const data = await mediaService.rollbackProfilePictures(resolveAccountId(req), req.body.storageKeys);
  res.status(200).json({ success: true, message: 'Upload rollback completed', data });
}));

/** DELETE /media/profile-pictures/:pictureId — delete a profile picture */
router.delete('/profile-pictures/:pictureId', asyncWrapper(async (req, res) => {
  const pictureId = parseInt(req.params.pictureId, 10);
  if (isNaN(pictureId) || pictureId <= 0) {
    res.status(400).json({ success: false, message: 'Invalid picture ID' });
    return;
  }
  const data = await mediaService.deleteProfilePicture(resolveAccountId(req), pictureId);
  res.status(200).json({ success: true, message: 'Profile picture deleted', data });
}));

/** GET /media/profile-pictures/verification/status — get photo verification status */
router.get('/profile-pictures/verification/status', asyncWrapper(async (req, res) => {
  const data = await mediaService.profilePictureVerificationStatus(resolveAccountId(req));
  res.status(200).json({ success: true, message: 'Photo verification status fetched', data });
}));

/** POST /media/profile-pictures/verification/submit — submit pictures for verification */
router.post('/profile-pictures/verification/submit', validateBody(verifySubmitBodySchema), asyncWrapper(async (req, res) => {
  const data = await mediaService.submitProfilePictureVerification(resolveAccountId(req), req.body);
  res.status(200).json({ success: true, message: 'Photo verification submitted', data });
}));

export default router;
