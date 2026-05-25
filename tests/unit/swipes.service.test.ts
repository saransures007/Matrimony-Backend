/// <reference types="jest" />
/**
 * Unit tests: Swipes Service matchmaking filters
 * Fully mocked — no DB connection needed
 */

jest.mock('../../src/database', () => {
  const profiles = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  };

  const sequelize = {
    query: jest.fn(),
    transaction: jest.fn(),
  };

  return {
    DB: {
      profiles,
      swipe_history: { findAll: jest.fn() },
      profile_likes: { create: jest.fn(), findOne: jest.fn() },
      matches: { findOrCreate: jest.fn() },
      profile_picture: { findAll: jest.fn(), count: jest.fn() },
      occupation_role_lookup: { findAll: jest.fn() },
      occupation_category_lookup: {},
      education_degree_lookup: { findAll: jest.fn() },
      realtime: {},
      sequelize,
    },
  };
});

jest.mock('../../src/modules/realtime/realtime.service', () => ({
  realtimeService: {
    emitToAccount: jest.fn(),
  },
}));

import { Op } from 'sequelize';
import { DB } from '../../src/database';
import { swipesService } from '../../src/modules/swipes/swipes.service';

const mockedDb = DB as unknown as {
  profiles: {
    findOne: jest.Mock;
    findAll: jest.Mock;
    count: jest.Mock;
  };
  swipe_history: {
    findAll: jest.Mock;
  };
  profile_picture: {
    findAll: jest.Mock;
    count: jest.Mock;
  };
  occupation_role_lookup: {
    findAll: jest.Mock;
  };
  education_degree_lookup: {
    findAll: jest.Mock;
  };
  sequelize: {
    query: jest.Mock;
  };
};

const baseProfile = {
  profileId: 'profile-me',
  accountId: 'account-me',
  fullname: 'Me',
  profileCreatedFor: 'Self',
  dateOfBirth: new Date('1995-01-01'),
  gender: 'Male',
  maritalStatus: 'Single',
  profileStatus: 'Active',
  isSearchable: true,
  visibility: 'Public',
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
  matrimonyModeId: 1,
  religionId: 10,
  casteId: 20,
  subcasteId: 200,
};

const makeCandidate = (overrides: Record<string, unknown> = {}) => ({
  profileId: 'profile-candidate',
  accountId: 'account-candidate',
  fullname: 'Candidate',
  profileCreatedFor: 'Self',
  dateOfBirth: new Date('1996-01-01'),
  gender: 'Female',
  maritalStatus: 'Single',
  profileStatus: 'Active',
  isSearchable: true,
  visibility: 'Public',
  createdAt: new Date('2026-01-02T10:00:00.000Z'),
  updatedAt: new Date('2026-01-02T10:00:00.000Z'),
  matrimonyModeId: 2,
  religionId: 10,
  casteId: 20,
  imageUrl: 'https://example.com/profile.jpg',
  ...overrides,
});

describe('swipesService.nextProfiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedDb.profiles.findOne.mockResolvedValue(baseProfile);
    mockedDb.swipe_history.findAll.mockResolvedValue([]);
    mockedDb.sequelize.query.mockResolvedValue([{ url: 'https://example.com/profile.jpg' }]);
  });

  it('applies strict same-caste and same-religion filtering for mode 1', async () => {
    mockedDb.profiles.count.mockResolvedValue(1);
    mockedDb.profiles.findAll.mockResolvedValue([makeCandidate()]);
    mockedDb.profiles.findOne.mockResolvedValue({
      ...baseProfile,
      matrimonyModeId: 1,
      religionId: 10,
      casteId: 20,
    });

    await swipesService.nextProfiles('account-me', undefined, 10);

    expect(mockedDb.profiles.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          religionId: 10,
          casteId: 20,
        }),
      }),
    );

    const calledWhere = mockedDb.profiles.findAll.mock.calls[0][0].where as Record<string, unknown>;
    expect(calledWhere).not.toHaveProperty('matrimonyModeId');
    expect(calledWhere).toMatchObject({
      religionId: 10,
      casteId: 20,
    });
  });

  it('does not apply any caste restriction for universal mode 2', async () => {
    mockedDb.profiles.count.mockResolvedValue(1);
    mockedDb.profiles.findAll.mockResolvedValue([
      makeCandidate({
        matrimonyModeId: 2,
        religionId: 99,
        casteId: 999,
      }),
    ]);
    mockedDb.profiles.findOne.mockResolvedValue({
      ...baseProfile,
      matrimonyModeId: 2,
    });

    await swipesService.nextProfiles('account-me', undefined, 10);

    expect(mockedDb.profiles.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          profileStatus: 'Active',
          isSearchable: true,
          visibility: 'Public',
        }),
      }),
    );

    const calledWhere = mockedDb.profiles.findAll.mock.calls[0][0].where as Record<string, unknown>;
    expect(calledWhere).not.toHaveProperty('religionId');
    expect(calledWhere).not.toHaveProperty('casteId');
  });

  it('filters to IT-oriented occupations for mode 3', async () => {
    mockedDb.profiles.count.mockResolvedValue(1);
    mockedDb.occupation_role_lookup.findAll.mockResolvedValue([
      { id: 1, role_name: 'Software Engineer', category: { name: 'IT' } },
      { id: 2, role_name: 'Teacher', category: { name: 'Education' } },
    ]);
    mockedDb.profiles.findAll.mockResolvedValue([
      makeCandidate({
        matrimonyModeId: 3,
        occupationRoleId: 1,
      }),
    ]);
    mockedDb.profiles.findOne.mockResolvedValue({
      ...baseProfile,
      matrimonyModeId: 3,
      religionId: 10,
      casteId: 20,
    });

    await swipesService.nextProfiles('account-me', undefined, 10);

    expect(mockedDb.occupation_role_lookup.findAll).toHaveBeenCalledTimes(1);
    const calledWhere = mockedDb.profiles.findAll.mock.calls[0][0].where as Record<string, unknown>;
    const occupationClause = calledWhere.occupationRoleId as Record<symbol, unknown>;
    expect(Array.isArray(occupationClause[Op.in])).toBe(true);
    expect(occupationClause[Op.in]).toEqual(expect.arrayContaining([1]));
    expect(calledWhere).not.toHaveProperty('religionId');
    expect(calledWhere).not.toHaveProperty('casteId');
  });

  it('filters to divorcee or widow profiles for mode 5', async () => {
    mockedDb.profiles.count.mockResolvedValue(1);
    mockedDb.profiles.findAll.mockResolvedValue([
      makeCandidate({
        matrimonyModeId: 5,
        maritalStatus: 'Widowed',
      }),
    ]);
    mockedDb.profiles.findOne.mockResolvedValue({
      ...baseProfile,
      matrimonyModeId: 5,
      religionId: 10,
      casteId: 20,
    });

    await swipesService.nextProfiles('account-me', undefined, 10);

    const calledWhere = mockedDb.profiles.findAll.mock.calls[0][0].where as Record<string, unknown>;
    const maritalClause = calledWhere.maritalStatus as Record<symbol, unknown>;
    expect(maritalClause[Op.in]).toEqual(['Divorced', 'Widowed']);
    expect(calledWhere).not.toHaveProperty('religionId');
    expect(calledWhere).not.toHaveProperty('casteId');
  });
});
