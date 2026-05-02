import { DB } from '@/database';
import { Op } from 'sequelize';

export interface IMatchProfile {
  profileId: string;
  fullname: string;
  profileCreatedFor: string;
  dateOfBirth: Date;
  gender: string;
  maritalStatus: string;
  aboutMe?: string;
  matrimonyModeId?: number;
  cityId?: number;
  educationDegreeId?: number;
  occupationRoleId?: number;
  heightId?: number;
  religionId?: number;
  casteId?: number;
}

export const matchesService = {
  getMatchesForUser: async (accountId: string): Promise<IMatchProfile[]> => {
    // Find the current user's profile
    const myProfile = await DB.profiles.findOne({
      where: { accountId },
    });

    if (!myProfile) {
      throw new Error('Profile not found');
    }

    const myModeId = myProfile.matrimonyModeId;

    // If user hasn't selected a mode, return empty
    if (!myModeId) {
      return [];
    }

    // Find other profiles with the same matrimony mode
    const matches = await DB.profiles.findAll({
      where: {
        matrimonyModeId: myModeId,
        profileId: { [Op.ne]: myProfile.profileId },
        profileStatus: 'Active',
        isSearchable: true,
      },
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    return matches.map((profile: any) => ({
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
    }));
  },
};
