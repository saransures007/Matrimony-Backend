/**
 * Unit tests: Account Deletion Service
 * Fully mocked — no DB connection needed
 */

jest.mock('@/database', () => {
  const query = jest.fn();
  const transaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  return {
    DB: {
      sequelize: {
        query,
        transaction: jest.fn().mockResolvedValue(transaction),
        getDialect: jest.fn().mockReturnValue('postgres'),
      },
    },
  };
});

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/utils/redis', () => ({
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
}));

import { DB } from '@/database';
import { deleteUserAccount } from '@/modules/user/account-deletion.service';

const mockedDb = DB as unknown as {
  sequelize: {
    query: jest.Mock;
    transaction: jest.Mock;
    getDialect: jest.Mock;
  };
};

describe('Account Deletion Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDb.sequelize.getDialect.mockReturnValue('postgres');
  });

  it('should reject invalid UUID input', async () => {
    const result = await deleteUserAccount('not-a-uuid');

    expect(result.success).toBe(false);
    expect(result.deletedProfileIds).toEqual([]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      step: 'validate_input',
      message: 'accountId must be a valid UUID',
    });
  });

  it('should be idempotent when the account does not exist', async () => {
    mockedDb.sequelize.query.mockResolvedValueOnce([]);

    const result = await deleteUserAccount('123e4567-e89b-12d3-a456-426614174000');

    expect(result.success).toBe(true);
    expect(result.deletedProfileIds).toEqual([]);
    expect(result.errors).toEqual([]);
    expect(mockedDb.sequelize.transaction).toHaveBeenCalledTimes(1);
    expect(mockedDb.sequelize.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT account_id FROM accounts'),
      expect.objectContaining({
        replacements: { accountId: '123e4567-e89b-12d3-a456-426614174000' },
      }),
    );
  });

  it('should return profile ids and stop on dry run', async () => {
    const transaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockedDb.sequelize.transaction.mockResolvedValue(transaction);
    mockedDb.sequelize.query
      .mockResolvedValueOnce([{ account_id: '123e4567-e89b-12d3-a456-426614174000' }])
      .mockResolvedValueOnce([
        { profile_id: '223e4567-e89b-12d3-a456-426614174000' },
        { profile_id: '323e4567-e89b-12d3-a456-426614174000' },
      ]);

    const result = await deleteUserAccount('123e4567-e89b-12d3-a456-426614174000', {
      dryRun: true,
    });

    expect(result.success).toBe(true);
    expect(result.deletedProfileIds).toEqual([
      '223e4567-e89b-12d3-a456-426614174000',
      '323e4567-e89b-12d3-a456-426614174000',
    ]);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
    expect(mockedDb.sequelize.query).toHaveBeenCalledTimes(2);
  });
});
