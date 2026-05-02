import { z } from 'zod';

export const presignProfilePicturesSchema = z.object({
  files: z.array(
    z.object({
      fileName: z.string().min(1).max(180),
      contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
      sizeBytes: z.number().int().positive().max(8 * 1024 * 1024),
      sortOrder: z.number().int().min(0).max(20).optional(),
      isProfilePic: z.boolean().optional(),
    }),
  ).min(1).max(8),
});

export const completeProfilePicturesSchema = z.object({
  uploads: z.array(
    z.object({
      uploadId: z.string().uuid(),
      storageKey: z.string().min(10).max(700),
      fileName: z.string().min(1).max(180),
      contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
      sizeBytes: z.number().int().positive().max(8 * 1024 * 1024),
      publicUrl: z.string().url(),
      sortOrder: z.number().int().min(0).max(20).default(0),
      isProfilePic: z.boolean().default(false),
    }),
  ).min(1).max(8),
});

export const rollbackProfilePicturesSchema = z.object({
  storageKeys: z.array(z.string().min(10).max(700)).min(1).max(8),
});

export const submitProfilePictureVerificationSchema = z.object({
  primaryPictureId: z.number().int().positive().optional(),
  consent: z.literal(true),
});

export const profilePictureVerificationStatusQuerySchema = z.object({
  // reserved for future filtering (per mode / provider)
  dummy: z.string().optional(),
});
