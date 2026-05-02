import { DB } from '@/database';
import { CustomError } from '@/utils/custom-error';
import { Op, UniqueConstraintError } from 'sequelize';
import { realtimeService } from '../realtime/realtime.service';

type SwipeAction = 'like' | 'reject';

const getMyProfile = async (accountId: string) => {
  const profile = await DB.profiles.findOne({ where: { accountId } });
  if (!profile) throw new CustomError('Profile not found', 404);
  return profile;
};

const canonicalPair = (a: string, b: string) => [a, b].sort();

const publicProfile = async (profile: any) => {
  const picture = await DB.profile_picture.findOne({
    where: { profileId: profile.profileId, uploadStatus: 'uploaded', isApproved: true },
    order: [['is_profile_pic', 'DESC'], ['sort_order', 'ASC'], ['created_at', 'ASC']],
  });

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
    imageUrl: picture?.url ?? null,
  };
};

export const swipesService = {
  profileDetails: async (accountId: string, profileId: string) => {
    const me = await getMyProfile(accountId);
    if (me.profileId === profileId) throw new CustomError('Use account profile endpoint for your own profile', 400);
    const profile = await DB.profiles.findOne({
      where: {
        profileId,
        profileStatus: 'Active',
        isSearchable: true,
        visibility: 'Public',
      },
    });
    if (!profile) throw new CustomError('Profile not found', 404);
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
    const [blockedRows] = await DB.sequelize.query(
      `SELECT blocked_profile_id AS profileId FROM profile_blocks WHERE blocker_profile_id = :profileId
       UNION
       SELECT blocker_profile_id AS profileId FROM profile_blocks WHERE blocked_profile_id = :profileId`,
      { replacements: { profileId: me.profileId } },
    ).catch(() => [[]]);
    const blockedIds = (blockedRows as any[]).map((row) => row.profileId);
    const excludedIds = [me.profileId, ...seenRows.map((row: any) => row.targetProfileId), ...blockedIds];

    const where: any = {
      profileId: { [Op.notIn]: excludedIds },
      profileStatus: 'Active',
      isSearchable: true,
      visibility: 'Public',
    };
    if (me.matrimonyModeId) where.matrimonyModeId = me.matrimonyModeId;
    if (cursor) where.createdAt = { [Op.lt]: new Date(cursor) };

    const profiles = await DB.profiles.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: limit + 1,
    });
    const hasMore = profiles.length > limit;
    const page = profiles.slice(0, limit);

    const items = await Promise.all(page.map(publicProfile));
    const approvedItems = items.filter((item: any) => item.imageUrl != null);
    return {
      data: approvedItems,
      nextCursor: hasMore ? page[page.length - 1]?.createdAt?.toISOString() : null,
    };
  },

  swipe: async (accountId: string, targetProfileId: string, action: SwipeAction) => {
    const me = await getMyProfile(accountId);
    if (me.profileId === targetProfileId) throw new CustomError('You cannot swipe on your own profile', 400);

    const target = await DB.profiles.findOne({
      where: {
        profileId: targetProfileId,
        profileStatus: 'Active',
        isSearchable: true,
      },
    });
    if (!target) throw new CustomError('Target profile is not available', 404);

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
          realtimeService.emitToAccount(target.accountId, 'like:new', { likeId: like.id, fromProfileId: me.profileId });
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

        realtimeService.emitToAccount(target.accountId, 'match:created', { matchId: match.id, profileId: me.profileId });
        realtimeService.emitToAccount(me.accountId, 'match:created', { matchId: match.id, profileId: targetProfileId });
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
