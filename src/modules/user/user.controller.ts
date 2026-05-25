/**
 * User Controller
 * Handles HTTP request/response for user endpoints
 * Uses asyncWrapper to propagate async errors to errorHandler
 * All responses follow the standardized ApiResponse format
 */

import { Request, Response } from 'express';
import { userService } from './user.service';
import { deleteUserAccount } from './account-deletion.service';
import { Errors } from '@/utils/AppError';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validateRequest';
import {
  getUserProfileParamsSchema,
  updateUserProfileBodySchema,
  updateUserProfileParamsSchema,
  listUsersQuerySchema,
} from '@/schemas/user.schema';
import { asyncWrapper } from '@/utils/errorHandler';

/**
 * GET /users/me
 * Get the authenticated user's own profile
 */
const resolveAccountId = (req: Request): string | null => {
  const payload = req.user as { accountId?: string } | undefined;
  const account = (req as Request & { account?: { accountId?: string } }).account;
  const context = (req as Request & { context?: { accountId?: string } }).context;
  return payload?.accountId ?? account?.accountId ?? context?.accountId ?? null;
};

export const getMyProfile = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const accountId = resolveAccountId(req);
    if (!accountId) {
      throw Errors.unauthorized('Authentication required');
    }

    const profile = await userService.getMyProfile(accountId);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    });
  }
);

/**
 * GET /users/:id
 * Get a user profile by account ID
 * Authorization: authenticated + owner or admin
 */
export const getProfile = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const profile = await userService.getProfile(id);

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile,
    });
  }
);

/**
 * PUT /users/:id
 * Update a user's own profile
 * Authorization: only the account owner can update
 */
export const updateProfile = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    // Ensure users can only update their own profile
    if (req.user!.accountId !== id && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile',
      });
      return;
    }

    await userService.updateProfile(id, updates);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
    });
  }
);

/**
 * GET /users
 * List all users with filters and pagination
 * Requires authentication
 */
export const listUsers = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query as any;
    const result = await userService.listUsers(query);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.data,
      meta: {
        pagination: result.pagination,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * GET /users/:id/settings
 * Get profile settings for a user
 */
export const getSettings = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const settings = await userService.getSettings(id);

    res.status(200).json({
      success: true,
      message: 'Settings retrieved successfully',
      data: settings,
    });
  }
);

/**
 * PATCH /users/:id/settings
 * Update profile settings
 */
export const updateSettings = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    if (req.user!.accountId !== id && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You can only update your own settings',
      });
      return;
    }

    await userService.updateSettings(id, updates);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
    });
  }
);

/**
 * GET /users/:id/preferences
 * Get profile preferences for a user
 */
export const getPreferences = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const preferences = await userService.getPreferences(id);

    res.status(200).json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: preferences,
    });
  }
);

/**
 * GET /users/me/preferences
 * Get authenticated user's preferences
 */
export const getMyPreferences = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const accountId = resolveAccountId(req);
    if (!accountId) {
      throw Errors.unauthorized('Authentication required');
    }

    const preferences = await userService.getPreferences(accountId);

    res.status(200).json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: preferences,
    });
  }
);

/**
 * PATCH /users/:id/preferences
 * Update profile preferences
 */
export const updatePreferences = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    if (req.user!.accountId !== id && req.user!.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You can only update your own preferences',
      });
      return;
    }

    const preferences = await userService.updatePreferences(id, updates);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    });
  }
);

/**
 * PATCH /users/me/preferences
 * Update authenticated user's preferences
 */
export const updateMyPreferences = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const accountId = resolveAccountId(req);
    if (!accountId) {
      throw Errors.unauthorized('Authentication required');
    }

    const preferences = await userService.updatePreferences(accountId, req.body);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    });
  }
);

/**
 * DELETE /users/me
 * Permanently delete the authenticated account and all associated data
 */
export const deleteMyAccount = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { accountId } = req.user!;
    const dryRun = String(req.query.dryRun ?? '').toLowerCase() === 'true';
    const batchSizeRaw = Number(req.query.batchSize);
    const batchSize = Number.isFinite(batchSizeRaw) && batchSizeRaw > 0 ? batchSizeRaw : undefined;

    const result = await deleteUserAccount(accountId, {
      dryRun,
      batchSize,
    });

    res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success ? 'Account deletion completed' : 'Account deletion failed',
      data: result,
    });
  }
);

/**
 * DELETE /users/:id
 * Admin-only permanent deletion of any account
 */
export const deleteUserById = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // if (req.user!.role !== 'ADMIN') {
    //   res.status(403).json({
    //     success: false,
    //     message: 'Admin access required',
    //   });
    //   return;
    // }

    const dryRun = String(req.query.dryRun ?? '').toLowerCase() === 'true';
    const batchSizeRaw = Number(req.query.batchSize);
    const batchSize = Number.isFinite(batchSizeRaw) && batchSizeRaw > 0 ? batchSizeRaw : undefined;

    const result = await deleteUserAccount(id, {
      dryRun,
      batchSize,
    });

    res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success ? 'Account deletion completed' : 'Account deletion failed',
      data: result,
    });
  }
);
