/**
 * User Service
 * Business logic layer — orchestrates repo calls and caching
 */

import * as userRepo from './user.repo';
import type { UserProfileResult } from './user.repo';
import { cacheOrFetch, invalidateKey, CacheKeys } from '@/utils/redis';
import { Errors } from '@/utils/AppError';
import { ListUsersQuery, UpdateUserProfileBody } from '@/schemas/user.schema';
import logger from '@/utils/logger';
import { Response } from '@/utils/ApiResponse';

const CACHE_TTL = 300; // 5 minutes

export const userService = {
  /**
   * Get a user profile by accountId
   * Cached for 5 minutes, invalidated on update
   */
  getProfile: async (accountId: string): Promise<UserProfileResult> => {
    const cached = await cacheOrFetch<UserProfileResult | null>(
      CacheKeys.userProfile(accountId),
      () => userRepo.findById(accountId),
      CACHE_TTL
    );

    if (!cached) throw Errors.notFound('User');
    return cached;
  },

  /**
   * Get the authenticated user's own profile
   */
  getMyProfile: async (accountId: string): Promise<UserProfileResult> => {
    return userService.getProfile(accountId);
  },

  /**
   * List users with filters and pagination
   * Results are NOT cached (dynamic data)
   */
  listUsers: async (
    query: ListUsersQuery
  ): Promise<{ data: UserProfileResult[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
    const { rows, count } = await userRepo.listUsers(query);

    return {
      data: rows,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: count,
        totalPages: Math.ceil(count / query.limit),
      },
    };
  },

  /**
   * Update a user's own profile
   * Invalidates cache after update
   */
  updateProfile: async (
    accountId: string,
    updates: UpdateUserProfileBody
  ): Promise<void> => {
    await userRepo.updateProfile(accountId, updates);

    // Invalidate cached profile
    await invalidateKey(CacheKeys.userProfile(accountId));

    logger.info({ accountId, type: 'profile_update', fields: Object.keys(updates) });
  },

  /**
   * Update account-level fields (displayName)
   */
  updateAccount: async (
    accountId: string,
    updates: { displayName?: string }
  ): Promise<void> => {
    await userRepo.updateAccount(accountId, updates);
    await invalidateKey(CacheKeys.userProfile(accountId));
  },

  /**
   * Check if a user exists by accountId
   */
  exists: async (accountId: string): Promise<boolean> => {
    return await userRepo.existsById(accountId);
  },

  /**
   * Get profile settings (with Redis caching)
   */
  getSettings: async (accountId: string) => {
    const cacheKey = CacheKeys.userSettings(accountId);
    return await cacheOrFetch(
      cacheKey,
      () => userRepo.getProfileSettings(accountId),
      600 // 10 minutes
    );
  },

  /**
   * Update profile settings
   */
  updateSettings: async (
    accountId: string,
    updates: Record<string, unknown>
  ): Promise<void> => {
    await userRepo.updateProfileSettings(accountId, updates);
    await invalidateKey(CacheKeys.userSettings(accountId));
  },

  /**
   * Get profile preferences (with Redis caching)
   */
  getPreferences: async (accountId: string) => {
    const cacheKey = CacheKeys.userPreferences(accountId);
    return await cacheOrFetch(
      cacheKey,
      () => userRepo.getProfilePreferences(accountId),
      600
    );
  },

  /**
   * Update profile preferences
   */
  updatePreferences: async (
    accountId: string,
    updates: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    const saved = await userRepo.updateProfilePreferences(accountId, updates);
    await invalidateKey(CacheKeys.userPreferences(accountId));
    return saved;
  },
};
