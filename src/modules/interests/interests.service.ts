import { DB } from '@/database';
import { CustomError } from '@/utils/custom-error';
import { Op, UniqueConstraintError } from 'sequelize';
import { realtimeService } from '../realtime/realtime.service';

const getMyProfile = async (accountId: string) => {
  const profile = await DB.profiles.findOne({ where: { accountId } });
  if (!profile) throw new CustomError('Profile not found', 404);
  return profile;
};

const canonicalPair = (a: string, b: string) => [a, b].sort();

const profileSummary = async (profileId: string) => {
  const [profile, picture] = await Promise.all([
    DB.profiles.findOne({ where: { profileId } }),
    DB.profile_picture.findOne({
      where: { profileId, uploadStatus: 'uploaded', isApproved: true },
      order: [['is_profile_pic', 'DESC'], ['sort_order', 'ASC'], ['created_at', 'ASC']],
    }),
  ]);
  if (!profile) return null;
  return {
    profileId: profile.profileId,
    fullname: profile.fullname,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    maritalStatus: profile.maritalStatus,
    aboutMe: profile.aboutMe,
    imageUrl: picture?.url ?? null,
  };
};

const parseCursor = (cursor?: string) => cursor ? { [Op.lt]: new Date(cursor) } : undefined;

export const interestsService = {
  received: async (accountId: string, cursor?: string, limit = 20) => {
    const me = await getMyProfile(accountId);
    const rows = await DB.profile_likes.findAll({
      where: {
        likedProfileId: me.profileId,
        status: 'pending',
        ...(cursor ? { createdAt: parseCursor(cursor) } : {}),
      },
      order: [['created_at', 'DESC']],
      limit: limit + 1,
    });
    const page = rows.slice(0, limit);
    const items = await Promise.all(page.map(async (like: any) => ({
      likeId: like.id,
      status: like.status,
      createdAt: like.createdAt,
      profile: await profileSummary(like.likerProfileId),
    })));
    return { data: items.filter((item) => item.profile), nextCursor: rows.length > limit ? page[page.length - 1].createdAt.toISOString() : null };
  },

  sent: async (accountId: string, cursor?: string, limit = 20) => {
    const me = await getMyProfile(accountId);
    const rows = await DB.profile_likes.findAll({
      where: {
        likerProfileId: me.profileId,
        ...(cursor ? { createdAt: parseCursor(cursor) } : {}),
      },
      order: [['created_at', 'DESC']],
      limit: limit + 1,
    });
    const page = rows.slice(0, limit);
    const items = await Promise.all(page.map(async (like: any) => ({
      likeId: like.id,
      status: like.status,
      createdAt: like.createdAt,
      profile: await profileSummary(like.likedProfileId),
    })));
    return { data: items.filter((item) => item.profile), nextCursor: rows.length > limit ? page[page.length - 1].createdAt.toISOString() : null };
  },

  matches: async (accountId: string, cursor?: string, limit = 20) => {
    const me = await getMyProfile(accountId);
    const where: any = {
      [Op.or]: [{ profileAId: me.profileId }, { profileBId: me.profileId }],
    };
    if (cursor) where.createdAt = parseCursor(cursor);
    const rows = await DB.matches.findAll({ where, order: [['created_at', 'DESC']], limit: limit + 1 });
    const page = rows.slice(0, limit);
    const items = await Promise.all(page.map(async (match: any) => {
      const otherProfileId = match.profileAId === me.profileId ? match.profileBId : match.profileAId;
      return {
        matchId: match.id,
        createdAt: match.createdAt,
        profile: await profileSummary(otherProfileId),
      };
    }));
    return { data: items.filter((item) => item.profile), nextCursor: rows.length > limit ? page[page.length - 1].createdAt.toISOString() : null };
  },

  accept: async (accountId: string, likeId: number) => {
    const me = await getMyProfile(accountId);
    return DB.sequelize.transaction(async (transaction: any) => {
      const inbound = await DB.profile_likes.findOne({
        where: { id: likeId, likedProfileId: me.profileId, status: 'pending' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!inbound) throw new CustomError('Interest not found', 404);

      await inbound.update({ status: 'accepted' }, { transaction });
      try {
        await DB.profile_likes.findOrCreate({
          where: { likerProfileId: me.profileId, likedProfileId: inbound.likerProfileId },
          defaults: { likerProfileId: me.profileId, likedProfileId: inbound.likerProfileId, status: 'accepted' },
          transaction,
        });
      } catch (error) {
        if (!(error instanceof UniqueConstraintError)) throw error;
      }

      const [profileAId, profileBId] = canonicalPair(me.profileId, inbound.likerProfileId);
      const [match] = await DB.matches.findOrCreate({
        where: { profileAId, profileBId },
        defaults: { profileAId, profileBId },
        transaction,
      });
      const otherProfile = await DB.profiles.findOne({ where: { profileId: inbound.likerProfileId }, transaction });
      if (otherProfile) {
        realtimeService.emitToAccount(otherProfile.accountId, 'interest:accepted', { likeId, matchId: match.id, profileId: me.profileId });
        realtimeService.emitToAccount(otherProfile.accountId, 'match:created', { matchId: match.id, profileId: me.profileId });
      }
      return { matchId: match.id };
    });
  },

  reject: async (accountId: string, likeId: number) => {
    const me = await getMyProfile(accountId);
    const [count] = await DB.profile_likes.update(
      { status: 'rejected' },
      { where: { id: likeId, likedProfileId: me.profileId, status: 'pending' } },
    );
    if (count === 0) throw new CustomError('Interest not found', 404);
    return { rejected: true };
  },
};
