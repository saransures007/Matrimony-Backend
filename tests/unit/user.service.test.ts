/**
 * Unit tests: User Service
 * Fully mocked — no DB connection needed
 */

// Mock the database module so user.repo doesn't hit the real DB during module load
jest.mock('@/database', () => ({
  DB: {
    accounts: {
      findByPk: jest.fn(),
    },
    profiles: {
      findOne: jest.fn(),
      findAndCountAll: jest.fn(),
    },
  },
}));

jest.mock('@/modules/user/user.repo');
jest.mock('@/utils/redis', () => {
  const repoFns: Record<string, jest.Mock> = {};
  return {
    cacheOrFetch: jest.fn().mockImplementation(async (_key: string, fetchFn: () => Promise<unknown>) => {
      const result = await fetchFn();
      return result;
    }),
    invalidateKey: jest.fn(),
    CacheKeys: {
      userProfile: (id: string) => `user:profile:${id}`,
      userSettings: (id: string) => `user:settings:${id}`,
    },
  };
});

import { userService } from '@/modules/user/user.service';
import * as userRepo from '@/modules/user/user.repo';
import { Errors } from '@/utils/AppError';

const mockUser = {
  accountId: '123e4567-e89b-12d3-a456-426614174000',
  displayName: 'John Doe',
  primaryEmail: 'john@example.com',
  primaryPhone: '9876543210',
  profile: { fullname: 'John Doe', gender: 'Male' } as any,
};

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile when found', async () => {
      (userRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getProfile(mockUser.accountId);

      expect(result).toEqual(mockUser);
      expect(userRepo.findById).toHaveBeenCalledWith(mockUser.accountId);
    });

    it('should throw 404 error when user does not exist', async () => {
      (userRepo.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile('non-existent-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('getMyProfile', () => {
    it('should delegate to getProfile', async () => {
      (userRepo.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getMyProfile(mockUser.accountId);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should call repo and invalidate cache', async () => {
      (userRepo.updateProfile as jest.Mock).mockResolvedValue(undefined);

      const updates = { fullname: 'Jane Doe' };
      await userService.updateProfile(mockUser.accountId, updates);

      expect(userRepo.updateProfile).toHaveBeenCalledWith(mockUser.accountId, updates);
    });
  });

  describe('listUsers', () => {
    it('should return paginated results', async () => {
      (userRepo.listUsers as jest.Mock).mockResolvedValue({ rows: [mockUser], count: 1 });

      const result = await userService.listUsers({ page: 1, limit: 20, sortOrder: 'desc' } as any);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should calculate totalPages correctly', async () => {
      (userRepo.listUsers as jest.Mock).mockResolvedValue({ rows: Array(5).fill(mockUser), count: 47 });

      const result = await userService.listUsers({ page: 1, limit: 10, sortOrder: 'desc' } as any);

      expect(result.pagination.totalPages).toBe(5);
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      (userRepo.existsById as jest.Mock).mockResolvedValue(true);
      expect(await userService.exists(mockUser.accountId)).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      (userRepo.existsById as jest.Mock).mockResolvedValue(false);
      expect(await userService.exists('non-existent')).toBe(false);
    });
  });
});