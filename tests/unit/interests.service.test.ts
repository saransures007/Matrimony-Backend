/// <reference types="jest" />
/**
 * Unit tests: Interests Service pagination safety
 * Fully mocked — no DB connection needed
 */

jest.mock('../../src/database', () => {
  const profiles = {
    findOne: jest.fn(),
  };

  const profileLikes = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    findOrCreate: jest.fn(),
  };

  const matches = {
    findAll: jest.fn(),
    findOrCreate: jest.fn(),
  };

  const profilePicture = {
    findOne: jest.fn(),
  };

  const sequelize = {
    transaction: jest.fn(),
  };

  return {
    DB: {
      profiles,
      profile_likes: profileLikes,
      matches,
      profile_picture: profilePicture,
      sequelize,
    },
  };
});

jest.mock('../../src/modules/realtime/realtime.service', () => ({
  realtimeService: {
    emitToAccount: jest.fn(),
  },
}));

import { DB } from '../../src/database';
import { interestsService } from '../../src/modules/interests/interests.service';

const mockedDb = DB as unknown as {
  profiles: {
    findOne: jest.Mock;
  };
  profile_likes: {
    findAll: jest.Mock;
  };
  profile_picture: {
    findOne: jest.Mock;
  };
};

describe('interestsService.sent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedDb.profiles.findOne.mockImplementation(({ where }: { where: { accountId?: string; profileId?: string } }) => {
      if (where.accountId === 'account-me') {
        return Promise.resolve({
          profileId: 'profile-me',
          accountId: 'account-me',
          fullname: 'Me',
          dateOfBirth: new Date('1995-01-01'),
          gender: 'Male',
          maritalStatus: 'Single',
          aboutMe: 'About me',
        });
      }

      if (where.profileId === 'profile-target') {
        return Promise.resolve({
          profileId: 'profile-target',
          fullname: 'Target',
          dateOfBirth: new Date('1996-01-01'),
          gender: 'Female',
          maritalStatus: 'Single',
          aboutMe: 'About target',
        });
      }

      return Promise.resolve(null);
    });

    mockedDb.profile_picture.findOne.mockResolvedValue({
      url: 'https://example.com/profile.jpg',
    });
  });

  it('returns sent interests without crashing when the last row has no createdAt value', async () => {
    mockedDb.profile_likes.findAll.mockResolvedValue([
      {
        id: 101,
        status: 'pending',
        createdAt: undefined,
        likerProfileId: 'profile-me',
        likedProfileId: 'profile-target',
      },
      {
        id: 102,
        status: 'pending',
        createdAt: undefined,
        likerProfileId: 'profile-me',
        likedProfileId: 'profile-target-2',
      },
    ]);

    const result = await interestsService.sent('account-me', undefined, 1);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      likeId: 101,
      status: 'pending',
      profile: expect.objectContaining({
        profileId: 'profile-target',
        fullname: 'Target',
        imageUrl: 'https://example.com/profile.jpg',
      }),
    });
    expect(result.nextCursor).toBeNull();
  });

  it('returns an ISO cursor when the page has a valid createdAt timestamp', async () => {
    mockedDb.profile_likes.findAll.mockResolvedValue([
      {
        id: 201,
        status: 'pending',
        createdAt: new Date('2026-05-24T00:00:00.000Z'),
        likerProfileId: 'profile-me',
        likedProfileId: 'profile-target',
      },
      {
        id: 202,
        status: 'pending',
        createdAt: new Date('2026-05-23T23:00:00.000Z'),
        likerProfileId: 'profile-me',
        likedProfileId: 'profile-target',
      },
    ]);

    const result = await interestsService.sent('account-me', undefined, 1);

    expect(result.data).toHaveLength(1);
    expect(result.nextCursor).toBe('2026-05-24T00:00:00.000Z');
  });
});
