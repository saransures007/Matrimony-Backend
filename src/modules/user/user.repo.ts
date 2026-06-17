/**
 * User Repository
 * Data access layer for user/account operations
 * All DB queries go through this module — no raw queries in services
 */

import { DB } from '@/database';
import { Op, WhereOptions } from 'sequelize';
import { ListUsersQuery, UpdateUserProfileBody } from '@/schemas/user.schema';
import { Errors } from '@/utils/AppError';

type PreferenceRecord = Record<string, unknown>;

export interface UserProfileResult {
  accountId: string;
  displayName: string;
  primaryEmail?: string;
  primaryPhone?: string;
  email?: string;
  phone?: string;
  profile?: InstanceType<typeof DB.profiles>;
}

/**
 * Find a user by accountId with profile joined
 */
export const findById = async (accountId: string): Promise<UserProfileResult | null> => {
  const [account, profile] = await Promise.all([
    DB.accounts.findByPk(accountId),
    DB.profiles.findOne({ where: { accountId } }),
  ]);

  if (!account) return null;

  const acc = account.get({ plain: true }) as {
    accountId?: string;
    account_id?: string;
    displayName?: string;
    display_name?: string;
    primaryEmail?: string | null;
    primary_email?: string | null;
    primaryPhone?: string | null;
    primary_phone?: string | null;
  };

  const primaryEmail = acc.primaryEmail ?? acc.primary_email ?? undefined;
  const primaryPhone = acc.primaryPhone ?? acc.primary_phone ?? undefined;

  return {
    accountId: acc.accountId ?? acc.account_id ?? accountId,
    displayName: acc.displayName ?? acc.display_name ?? '',
    primaryEmail,
    primaryPhone,
    email: primaryEmail,
    phone: primaryPhone,
    profile: profile ?? undefined,
  };
};

/**
 * Find a user by email or phone (for auth lookups)
 */
export const findByIdentifier = async (
  identifier: string
) => {
  const where: WhereOptions = identifier.includes('@')
    ? { primaryEmail: identifier }
    : /^\d+$/.test(identifier)
    ? { primaryPhone: identifier }
    : { displayName: identifier };

  return await DB.accounts.findOne({
    where,
    include: [{ model: DB.roles, as: 'roles', through: { attributes: [] } }],
  });
};

/**
 * List users with filters, pagination, and sorting
 */
export const listUsers = async (
  query: ListUsersQuery
): Promise<{ rows: UserProfileResult[]; count: number }> => {
  const {
    page,
    limit,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    gender,
    minAge,
    maxAge,
    motherTongueId,
    religionId,
    countryId,
    educationDegreeId,
    search,
  } = query;

  const offset = (page - 1) * limit;

  const profileWhere: WhereOptions = {};
  if (gender) profileWhere.gender = gender;
  if (motherTongueId) profileWhere.motherTongueId = motherTongueId;
  if (religionId) profileWhere.religionId = religionId;
  if (countryId) profileWhere.countryId = countryId;
  if (educationDegreeId) profileWhere.educationDegreeId = educationDegreeId;

  if (minAge || maxAge) {
    const now = new Date();
    if (minAge) {
      const maxDob = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
      profileWhere.dateOfBirth = { [Op.lte]: maxDob };
    }
    if (maxAge) {
      const minDob = new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate());
      profileWhere.dateOfBirth = {
        ...(profileWhere.dateOfBirth as object ?? {}),
        [Op.gte]: minDob,
      };
    }
  }

  const orConditions: WhereOptions[] = [];
  if (search) {
    orConditions.push(
      { fullname: { [Op.like]: `%${search}%` } } as WhereOptions,
      { aboutMe: { [Op.like]: `%${search}%` } } as WhereOptions
    );
    (profileWhere as any)[Op.or] = orConditions;
  }

  const { rows, count } = await DB.profiles.findAndCountAll({
    where: profileWhere,
    include: [
      {
        model: DB.accounts,
        as: 'account',
        where: { isActive: true },
        attributes: ['accountId', 'displayName', 'primaryEmail', 'primaryPhone'],
        required: true,
      },
    ],
    offset,
    limit,
    order: [[sortBy, sortOrder]],
    distinct: true,
  });

  return {
    rows: rows.map((p) => {
      const acc = ((p as any).account?.get?.({ plain: true }) ?? (p as any).account) as {
        accountId?: string;
        account_id?: string;
        displayName?: string;
        display_name?: string;
        primaryEmail?: string | null;
        primary_email?: string | null;
        primaryPhone?: string | null;
        primary_phone?: string | null;
      };
      const primaryEmail = acc.primaryEmail ?? acc.primary_email ?? undefined;
      const primaryPhone = acc.primaryPhone ?? acc.primary_phone ?? undefined;

      return {
        accountId: acc.accountId ?? acc.account_id ?? '',
        displayName: acc.displayName ?? acc.display_name ?? '',
        primaryEmail,
        primaryPhone,
        email: primaryEmail,
        phone: primaryPhone,
        profile: p,
      };
    }),
    count,
  };
};

/**
 * Update a user's profile fields
 */
export const updateProfile = async (
  accountId: string,
  updates: UpdateUserProfileBody
): Promise<UserProfileResult> => {
  const profile = await DB.profiles.findOne({ where: { accountId } });
  if (!profile) throw Errors.notFound('Profile');
  await profile.update(updates as any);

  const updated = await findById(accountId);
  if (!updated) throw Errors.notFound('User');
  return updated;
};

/**
 * Update account-level fields (displayName)
 */
export const updateAccount = async (
  accountId: string,
  updates: { displayName?: string }
): Promise<void> => {
  const account = await DB.accounts.findByPk(accountId);
  if (!account) throw Errors.notFound('Account');
  await account.update(updates);
};

/**
 * Check if account exists by accountId
 */
export const existsById = async (accountId: string): Promise<boolean> => {
  const account = await DB.accounts.findByPk(accountId, { attributes: ['accountId'] });
  return account !== null;
};

/**
 * Get profile settings for a user
 */
export const getProfileSettings = async (accountId: string) => {
  const profile = await DB.profiles.findOne({ where: { accountId }, attributes: ['profileId'] });
  if (!profile) return null;
  const { ProfileSettingsModel } = await import('../../database/models/profile/profile_settings.model.js');
  return ProfileSettingsModel.findByPk(profile.profileId);
};

/**
 * Update profile settings
 */
export const updateProfileSettings = async (
  accountId: string,
  updates: Record<string, unknown>
) => {
  const profile = await DB.profiles.findOne({ where: { accountId }, attributes: ['profileId'] });
  if (!profile) throw Errors.notFound('Profile');

  const { ProfileSettingsModel } = await import('../../database/models/profile/profile_settings.model.js');
  const settings = await ProfileSettingsModel.findByPk(profile.profileId);

  if (!settings) {
    await ProfileSettingsModel.create({ profileId: profile.profileId, ...updates } as any);
  } else {
    await settings.update(updates);
  }
};

/**
 * Get profile preferences for a user
 */
export const getProfilePreferences = async (accountId: string): Promise<PreferenceRecord | null> => {
  const profile = await DB.profiles.findOne({ where: { accountId }, attributes: ['profileId'] });
  if (!profile) return null;

  const preferences = await DB.profile_preferences.findByPk(profile.profileId);
  return preferences ? (preferences.toJSON() as unknown as PreferenceRecord) : null;
};

/**
 * Update profile preferences
 */
export const updateProfilePreferences = async (
  accountId: string,
  updates: Record<string, unknown>
): Promise<PreferenceRecord> => {
  const profile = await DB.profiles.findOne({ where: { accountId }, attributes: ['profileId'] });
  if (!profile) throw Errors.notFound('Profile');

  const preferences = await DB.profile_preferences.findByPk(profile.profileId);

  if (!preferences) {
    const created = await DB.profile_preferences.create({
      profileId: profile.profileId,
      ...updates,
    } as any);
    return created.toJSON() as unknown as PreferenceRecord;
  }

  await preferences.update(updates);
  return preferences.toJSON() as unknown as PreferenceRecord;
};
