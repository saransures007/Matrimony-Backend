/**
 * User Routes — /api/v1/users
 * All routes are prefixed with /api/v1/users
 * Auth + RBAC middleware applied at route group level
 */

import { Router } from 'express';
import { authenticate } from '@/middlewares/auth';
import { validateParams, validateQuery, validateBody } from '@/middlewares/validateRequest';
import {
  getUserProfileParamsSchema,
  updateUserProfileParamsSchema,
  updateUserProfileBodySchema,
  profilePreferencesBodySchema,
  listUsersQuerySchema,
} from '@/schemas/user.schema';
import {
  getProfile,
  getMyProfile,
  updateProfile,
  listUsers,
  getSettings,
  updateSettings,
  getPreferences,
  getMyPreferences,
  updatePreferences,
  updateMyPreferences,
  deleteMyAccount,
  deleteUserById,
} from './user.controller';

const router = Router();

 // All user routes require authentication
router.use(authenticate);

// GET /users/me — current user's profile
router.get('/me', getMyProfile);

// GET /users — list all users (paginated, filterable)
router.get('/', validateQuery(listUsersQuerySchema), listUsers);

// GET /users/:id — get specific user profile
router.get(
  '/:id',
  validateParams(getUserProfileParamsSchema),
  getProfile
);

// PUT /users/:id — update own profile
router.put(
  '/:id',
  validateParams(updateUserProfileParamsSchema),
  validateBody(updateUserProfileBodySchema),
  updateProfile
);

/**
 * GET /users/:id/settings — get profile settings
 */
router.get(
  '/:id/settings',
  validateParams(getUserProfileParamsSchema),
  getSettings
);

/**
 * GET /users/me/preferences — get authenticated user's preferences
 */
router.get('/me/preferences', getMyPreferences);

/**
 * GET /users/:id/preferences — get profile preferences
 */
router.get(
  '/:id/preferences',
  validateParams(getUserProfileParamsSchema),
  getPreferences
);

/**
 * DELETE /users/me — permanently delete authenticated account
 */
router.delete('/me', deleteMyAccount);

/**
 * DELETE /users/:id — admin-only permanent deletion of any account
 */
router.delete(
  '/:id',
  validateParams(getUserProfileParamsSchema),
  deleteUserById
);

/**
 * PATCH /users/:id/settings — update profile settings
 */
router.patch(
  '/:id/settings',
  validateParams(updateUserProfileParamsSchema),
  updateSettings
);

/**
 * PATCH /users/me/preferences — update authenticated user's preferences
 */
router.patch(
  '/me/preferences',
  validateBody(profilePreferencesBodySchema),
  updateMyPreferences
);

/**
 * PATCH /users/:id/preferences — update profile preferences
 */
router.patch(
  '/:id/preferences',
  validateParams(updateUserProfileParamsSchema),
  validateBody(profilePreferencesBodySchema),
  updatePreferences
);

export default router;
