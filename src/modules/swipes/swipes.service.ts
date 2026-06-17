import { DB } from '@/database';
import { CustomError } from '@/utils/custom-error';
import { Op, QueryTypes, UniqueConstraintError } from 'sequelize';
import { realtimeService } from '../realtime/realtime.service';

type SwipeAction = 'like' | 'reject';

type DiscoveryWhere = Record<string, unknown>;
type PreferenceRecord = Record<string, unknown>;

type OccupationRoleLookupRow = {
  id: number;
  role_name: string;
  category?: { name?: string | null } | null;
};

type EducationDegreeLookupRow = {
  id: number;
  degree_name: string;
  full_form?: string | null;
  education_type?: string | null;
};

type PreferenceContext = {
  where: DiscoveryWhere;
  requirePhoto: boolean;
};

const ACTIVE_PROFILE_WHERE = {
  profileStatus: 'Active' as const,
  isSearchable: true,
  visibility: 'Public' as const,
};

const IT_ROLE_KEYWORDS = ['it', 'software', 'developer', 'engineer', 'programmer', 'technology'];
const DOCTOR_ROLE_KEYWORDS = ['doctor', 'physician', 'medical', 'surgeon', 'clinician'];
const DOCTOR_DEGREE_KEYWORDS = ['mbbs', 'md', 'doctor of medicine', 'medicine'];
const DEFAULT_MAX_INACTIVE_DAYS = 30;

const getMyProfile = async (accountId: string) => {
  const profile = await DB.profiles.findOne({ where: { accountId } });
  if (!profile) {
    throw new CustomError('Profile not found', 404);
  }
  return profile;
};

const canonicalPair = (a: string, b: string) => {
  const pair = [a, b].sort();
  return pair as [string, string];
};

const hasKeyword = (value: string | null | undefined, keywords: string[]) => {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
};

const toNumberList = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item) && item > 0);
};

const toStringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);
};

const normalizeGender = (value: unknown): 'Male' | 'Female' | 'Other' | 'Any' | null => {
  if (typeof value !== 'string') return null;

  const normalized = value.trim();
  if (
    normalized === 'Male' ||
    normalized === 'Female' ||
    normalized === 'Other' ||
    normalized === 'Any'
  ) {
    return normalized;
  }

  return null;
};

const parseBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
};

const getFiniteNumber = (value: unknown): number | null => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const getDefaultPartnerGender = (gender: string | null | undefined) => {
  if (gender === 'Male') return 'Female';
  if (gender === 'Female') return 'Male';
  return null;
};

const readPreferenceRecord = (row: PreferenceRecord | null | undefined): PreferenceRecord => ({
  ...(row ?? {}),
});

const buildPreferenceContext = (me: any, preferencesRow: PreferenceRecord | null): PreferenceContext => {
  const preferences = readPreferenceRecord(preferencesRow);
  const where: DiscoveryWhere = {};

  const preferredGender = normalizeGender(preferences.preferredGender ?? preferences.preferred_gender);
  const preferredGenders = toStringList(
    preferences.preferredGenders ?? preferences.preferred_genders,
  )
    .map((gender) => normalizeGender(gender))
    .filter(
      (gender): gender is 'Male' | 'Female' | 'Other' | 'Any' =>
        gender === 'Male' || gender === 'Female' || gender === 'Other' || gender === 'Any',
    );

  const hasAnyGenderPreference = preferredGender === 'Any' || preferredGenders.includes('Any');
  const defaultPartnerGender = getDefaultPartnerGender(me.gender);

  if (!hasAnyGenderPreference) {
    if (preferredGender) {
      where.gender = preferredGender;
    } else if (preferredGenders.length > 0) {
      where.gender =
        preferredGenders.length === 1 ? preferredGenders[0] : { [Op.in]: preferredGenders };
    } else if (defaultPartnerGender) {
      where.gender = defaultPartnerGender;
    }
  }

  const preferredReligionIds = toNumberList(
    preferences.preferredReligionIds ?? preferences.preferred_religion_ids,
  );
  if (preferredReligionIds.length > 0) {
    where.religionId = { [Op.in]: preferredReligionIds };
  } else if (parseBoolean(preferences.preferSameReligion ?? preferences.prefer_same_religion) && me.religionId) {
    where.religionId = me.religionId;
  }

  const preferredCasteIds = toNumberList(preferences.preferredCasteIds ?? preferences.preferred_caste_ids);
  if (preferredCasteIds.length > 0) {
    where.casteId = { [Op.in]: preferredCasteIds };
  } else if (parseBoolean(preferences.preferSameCaste ?? preferences.prefer_same_caste) && me.casteId) {
    where.casteId = me.casteId;
  }

  const preferredSubcasteIds = toNumberList(
    preferences.preferredSubcasteIds ?? preferences.preferred_subcaste_ids,
  );
  if (preferredSubcasteIds.length > 0) {
    where.subcasteId = { [Op.in]: preferredSubcasteIds };
  } else if (
    parseBoolean(preferences.preferSameSubcaste ?? preferences.prefer_same_subcaste) &&
    me.subcasteId
  ) {
    where.subcasteId = me.subcasteId;
  }

  const preferredCountryIds = toNumberList(preferences.preferredCountryIds ?? preferences.preferred_country_ids);
  if (preferredCountryIds.length > 0) {
    where.countryId = { [Op.in]: preferredCountryIds };
  }

  const preferSameState = parseBoolean(preferences.preferSameState ?? preferences.prefer_same_state);
  const preferredStateIds = toNumberList(preferences.preferredStateIds ?? preferences.preferred_state_ids);
  if (preferredStateIds.length > 0) {
    where.stateId = { [Op.in]: preferredStateIds };
  } else if (preferSameState && me.stateId) {
    where.stateId = me.stateId;
  }

  const preferSameCity = parseBoolean(preferences.preferSameCity ?? preferences.prefer_same_city);
  const preferredCityIds = toNumberList(preferences.preferredCityIds ?? preferences.preferred_city_ids);
  if (preferredCityIds.length > 0) {
    where.cityId = { [Op.in]: preferredCityIds };
  } else if (preferSameCity && me.cityId) {
    where.cityId = me.cityId;
  }

  const preferSameMotherTongue = parseBoolean(
    preferences.preferSameMotherTongue ?? preferences.prefer_same_mother_tongue,
  );
  if (preferSameMotherTongue && me.motherTongueId) {
    where.motherTongueId = me.motherTongueId;
  }

  const preferredEducationIds = toNumberList(
    preferences.preferredEducationIds ?? preferences.preferred_education_ids,
  );
  if (preferredEducationIds.length > 0) {
    where.educationDegreeId = { [Op.in]: preferredEducationIds };
  }

  const preferredOccupationIds = toNumberList(
    preferences.preferredOccupationIds ?? preferences.preferred_occupation_ids,
  );
  if (preferredOccupationIds.length > 0) {
    where.occupationRoleId = { [Op.in]: preferredOccupationIds };
  }

  const preferredMaritalStatuses = toStringList(
    preferences.preferredMaritalStatusIds ?? preferences.preferred_marital_status_ids,
  );
  if (preferredMaritalStatuses.length > 0) {
    where.maritalStatus = { [Op.in]: preferredMaritalStatuses };
  }

  const minAge = getFiniteNumber(preferences.minAge ?? preferences.min_age);
  const maxAge = getFiniteNumber(preferences.maxAge ?? preferences.max_age);
  if (minAge !== null || maxAge !== null) {
    if (minAge !== null && maxAge !== null && minAge > maxAge) {
      throw new CustomError('Minimum age cannot be greater than maximum age', 400);
    }

    const now = new Date();

    if (minAge !== null) {
      where.dateOfBirth = {
        ...((where.dateOfBirth as Record<string, unknown>) ?? {}),
        [Op.lte]: new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate()),
      };
    }

    if (maxAge !== null) {
      where.dateOfBirth = {
        ...((where.dateOfBirth as Record<string, unknown>) ?? {}),
        [Op.gte]: new Date(now.getFullYear() - maxAge - 1, now.getMonth(), now.getDate()),
      };
    }
  }

  return {
    where,
    requirePhoto: parseBoolean(preferences.requirePhoto ?? preferences.require_photo, true),
  };
};

const buildModeSpecificWhere = async (me: any): Promise<DiscoveryWhere | null> => {
  const modeId = me.matrimonyModeId;

  if (!modeId) {
    return null;
  }

  switch (modeId) {
    case 1: {
      if (!me.religionId || !me.casteId) {
        return null;
      }

      return {
        religionId: me.religionId,
        casteId: me.casteId,
      };
    }

    case 2:
      return {};

    case 3: {
      const roleIds = await loadOccupationRoleIds((role) => {
        const roleName = role.role_name ?? '';
        const categoryName = role.category?.name ?? '';
        return hasKeyword(roleName, IT_ROLE_KEYWORDS) || hasKeyword(categoryName, IT_ROLE_KEYWORDS);
      });

      if (roleIds.length === 0) {
        return null;
      }

      return {
        occupationRoleId: { [Op.in]: roleIds },
      };
    }

    case 4: {
      const doctorRoleIds = await loadOccupationRoleIds((role) => {
        const roleName = role.role_name ?? '';
        const categoryName = role.category?.name ?? '';
        return hasKeyword(roleName, DOCTOR_ROLE_KEYWORDS) || hasKeyword(categoryName, DOCTOR_ROLE_KEYWORDS);
      });

      const doctorDegreeIds = await loadEducationDegreeIds((degree) => {
        const degreeName = degree.degree_name ?? '';
        const fullForm = degree.full_form ?? '';
        const educationType = degree.education_type ?? '';
        return (
          hasKeyword(degreeName, DOCTOR_DEGREE_KEYWORDS) ||
          hasKeyword(fullForm, DOCTOR_DEGREE_KEYWORDS) ||
          hasKeyword(educationType, DOCTOR_DEGREE_KEYWORDS)
        );
      });

      const orConditions: Array<Record<string, unknown>> = [];

      if (doctorRoleIds.length > 0) {
        orConditions.push({ occupationRoleId: { [Op.in]: doctorRoleIds } });
      }

      if (doctorDegreeIds.length > 0) {
        orConditions.push({ educationDegreeId: { [Op.in]: doctorDegreeIds } });
      }

      if (orConditions.length === 0) {
        return null;
      }

      return {
        [Op.or]: orConditions,
      };
    }

    case 5:
      return {
        maritalStatus: { [Op.in]: ['Divorced', 'Widowed'] },
      };

    default:
      return {};
  }
};

const buildDiscoveryWhere = async (
  me: any,
  excludedIds: string[],
  preferences: PreferenceContext['where'],
) => {
  const modeSpecificWhere = await buildModeSpecificWhere(me);

  if (modeSpecificWhere === null) {
    return null;
  }

  const where: DiscoveryWhere = {
    profileId: { [Op.notIn]: excludedIds },
    ...ACTIVE_PROFILE_WHERE,
    ...preferences,
    ...modeSpecificWhere,
  };

  return where;
};

const publicProfile = async (profile: any) => {
  const picture = (await DB.sequelize.query(
    `SELECT url FROM profile_picture 
     WHERE profile_id = :profileId 
       AND upload_status = 'uploaded' 
       AND is_approved = 1 
     ORDER BY is_profile_pic DESC, sort_order ASC, created_at ASC 
     LIMIT 1`,
    {
      replacements: { profileId: profile.profileId },
      type: QueryTypes.SELECT,
    },
  )) as Array<{ url: string }>;

  const imageUrl = picture.length > 0 ? picture[0].url : null;

  return {
    profileId: profile.profileId,
    fullname: profile.fullname,
    profileCreatedFor: profile.profileCreatedFor,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    maritalStatus: profile.maritalStatus,
    aboutMe: profile.aboutMe,
    matrimonyModeId: profile.matrimonyModeId,
    cityId: profile.cityId,
    educationDegreeId: profile.educationDegreeId,
    occupationRoleId: profile.occupationRoleId,
    heightId: profile.heightId,
    religionId: profile.religionId,
    casteId: profile.casteId,
    imageUrl,
  };
};

const loadOccupationRoleIds = async (
  matcher: (role: OccupationRoleLookupRow) => boolean,
): Promise<number[]> => {
  const roles = (await DB.occupation_role_lookup.findAll({
    include: [
      {
        model: DB.occupation_category_lookup,
        as: 'category',
        attributes: ['name'],
        required: false,
      },
    ],
    attributes: ['id', 'role_name', 'category_id'],
  })) as unknown as OccupationRoleLookupRow[];

  return roles.filter(matcher).map((role) => role.id);
};

const loadEducationDegreeIds = async (
  matcher: (degree: EducationDegreeLookupRow) => boolean,
): Promise<number[]> => {
  const degrees = (await DB.education_degree_lookup.findAll({
    attributes: ['id', 'degree_name', 'full_form', 'education_type'],
  })) as unknown as EducationDegreeLookupRow[];

  return degrees.filter(matcher).map((degree) => degree.id);
};

export const swipesService = {
  profileDetails: async (accountId: string, profileId: string) => {
    const me = await getMyProfile(accountId);

    if (me.profileId === profileId) {
      throw new CustomError('Use account profile endpoint for your own profile', 400);
    }

    const profile = await DB.profiles.findOne({
      where: {
        profileId,
        ...ACTIVE_PROFILE_WHERE,
      },
    });

    if (!profile) {
      throw new CustomError('Profile not found', 404);
    }

    const pictures = await DB.profile_picture.findAll({
      where: { profileId, uploadStatus: 'uploaded', isApproved: true },
      order: [['is_profile_pic', 'DESC'], ['sort_order', 'ASC'], ['created_at', 'ASC']],
    });

    return {
      ...(await publicProfile(profile)),
      pictures: pictures.map((picture: any) => ({
        id: picture.id,
        url: picture.url,
        isProfilePic: picture.isProfilePic,
      })),
      countryId: profile.countryId,
      stateId: profile.stateId,
      motherTongueId: profile.motherTongueId,
      subcasteId: profile.subcasteId,
      kulamId: profile.kulamId,
      employedInId: profile.employedInId,
      expectedSalaryId: profile.expectedSalaryId,
      weight: profile.weight,
    };
  },

  nextProfiles: async (accountId: string, cursor?: string, limit = 10) => {
    const me = await getMyProfile(accountId);

    const seenRows = await DB.swipe_history.findAll({
      where: { actorProfileId: me.profileId },
      attributes: ['targetProfileId'],
      limit: 5000,
      order: [['created_at', 'DESC']],
    });

    const blockedRows = (await DB.sequelize
      .query(
        `SELECT blocked_profile_id AS profileId FROM profile_blocks WHERE blocker_profile_id = :profileId
         UNION
         SELECT blocker_profile_id AS profileId FROM profile_blocks WHERE blocked_profile_id = :profileId`,
        {
          replacements: { profileId: me.profileId },
          type: QueryTypes.SELECT,
        },
      )
      .catch(() => [])) as Array<{ profileId: string | null }>;

    const blockedIds = blockedRows
      .map((row) => row.profileId)
      .filter((profileId): profileId is string => !!profileId);

    const seenIds = seenRows
      .map((row: any) => row.targetProfileId)
      .filter((profileId: unknown): profileId is string => typeof profileId === 'string' && profileId.length > 0);

    const excludedIds = [me.profileId, ...seenIds, ...blockedIds];

    const preferencesRow = DB.profile_preferences ? await DB.profile_preferences.findByPk(me.profileId) : null;
    const preferenceContext = buildPreferenceContext(
      me,
      preferencesRow ? (preferencesRow.toJSON() as unknown as PreferenceRecord) : null,
    );

    const baseWhere = await buildDiscoveryWhere(me, excludedIds, preferenceContext.where);
    if (!baseWhere) {
      return {
        data: [],
        nextCursor: null,
      };
    }

    const batchSize = Math.max(limit * 4, 25);
    const collected: Array<Record<string, unknown>> = [];
    let searchCursor = cursor;
    let nextCursor: string | null = null;

    while (collected.length < limit) {
      const where: DiscoveryWhere = {
        ...baseWhere,
        ...(searchCursor ? { createdAt: { [Op.lt]: new Date(searchCursor) } } : {}),
      };

      const profiles = await DB.profiles.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit: batchSize + 1,
      });

      if (profiles.length === 0) {
        nextCursor = null;
        break;
      }

      const hasMore = profiles.length > batchSize;
      const page = profiles.slice(0, batchSize);
      const items = await Promise.all(page.map(publicProfile));
      const approvedItems = preferenceContext.requirePhoto
        ? items.filter((item: any) => item.imageUrl != null)
        : items;

      collected.push(...approvedItems);

      const lastRow = page[page.length - 1];
      nextCursor = lastRow?.createdAt?.toISOString() ?? null;

      if (!hasMore || !nextCursor) {
        if (!hasMore) {
          nextCursor = null;
        }
        break;
      }

      searchCursor = nextCursor;
    }

    const data = collected.slice(0, limit);

    if (data.length < limit) {
      nextCursor = null;
    }

    return {
      data,
      nextCursor,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          totalAvailable: collected.length,
          swipedCount: seenRows.length,
          blockedCount: blockedIds.length,
          profilesWithImages: collected.filter((item: any) => item.imageUrl != null).length,
          profilesWithoutImages: collected.filter((item: any) => item.imageUrl == null).length,
        },
      }),
    };
  },

  swipe: async (accountId: string, targetProfileId: string, action: SwipeAction) => {
    const me = await getMyProfile(accountId);

    if (me.profileId === targetProfileId) {
      throw new CustomError('You cannot swipe on your own profile', 400);
    }

    const target = await DB.profiles.findOne({
      where: {
        profileId: targetProfileId,
        ...ACTIVE_PROFILE_WHERE,
      },
    });

    if (!target) {
      throw new CustomError('Target profile is not available', 404);
    }

    try {
      return await DB.sequelize.transaction(async (transaction: any) => {
        await DB.swipe_history.create(
          { actorProfileId: me.profileId, targetProfileId, action },
          { transaction },
        );

        if (action === 'reject') {
          return { status: 'rejected', matched: false };
        }

        const like = await DB.profile_likes.create(
          { likerProfileId: me.profileId, likedProfileId: targetProfileId, status: 'pending' },
          { transaction },
        );

        const reciprocal = await DB.profile_likes.findOne({
          where: {
            likerProfileId: targetProfileId,
            likedProfileId: me.profileId,
            status: { [Op.in]: ['pending', 'accepted'] },
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!reciprocal) {
          realtimeService.emitToAccount(target.accountId, 'like:new', {
            likeId: like.id,
            fromProfileId: me.profileId,
          });
          return { status: 'pending', matched: false, likeId: like.id };
        }

        await Promise.all([
          like.update({ status: 'accepted' }, { transaction }),
          reciprocal.update({ status: 'accepted' }, { transaction }),
        ]);

        const [profileAId, profileBId] = canonicalPair(me.profileId, targetProfileId);
        const [match] = await DB.matches.findOrCreate({
          where: { profileAId, profileBId },
          defaults: { profileAId, profileBId },
          transaction,
        });

        realtimeService.emitToAccount(target.accountId, 'match:created', {
          matchId: match.id,
          profileId: me.profileId,
        });
        realtimeService.emitToAccount(me.accountId, 'match:created', {
          matchId: match.id,
          profileId: targetProfileId,
        });

        return { status: 'matched', matched: true, matchId: match.id };
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new CustomError('Swipe already recorded', 409);
      }
      throw error;
    }
  },
};

export default swipesService;
