/**
 * User module Zod validation schemas
 * Validates request body, query, and URL params for user endpoints
 */

import { z } from 'zod';
import { uuidSchema, paginationSchema, sortSchema } from './common.schema';

/** ================================
 * Get User Profile (URL param)
 * ================================
 */
export const getUserProfileParamsSchema = z.object({
  id: uuidSchema,
});

export type GetUserProfileParams = z.infer<typeof getUserProfileParamsSchema>;

/** ================================
 * Update User Profile (URL + Body)
 * ================================
 */
export const updateUserProfileParamsSchema = z.object({
  id: uuidSchema,
});

export const updateUserProfileBodySchema = z.object({
  fullname: z.string().min(1).max(100).optional(),
  profileCreatedFor: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  dateOfBirth: z.string().datetime().pipe(z.coerce.date()).optional(),
  maritalStatus: z.enum(['Single', 'Divorced', 'Separated', 'Widowed']).optional(),
  motherTongueId: z.number().int().positive().optional(),
  countryId: z.number().int().positive().optional(),
  stateId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional(),
  heightId: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  educationDegreeId: z.number().int().positive().optional(),
  occupationRoleId: z.number().int().positive().optional(),
  employedInId: z.number().int().positive().optional(),
  expectedSalaryId: z.number().int().positive().optional(),
  aboutMe: z.string().max(2000).optional(),
  visibility: z.enum(['Public', 'Private']).optional(),
});

export type UpdateUserProfileParams = z.infer<typeof updateUserProfileParamsSchema>;
export type UpdateUserProfileBody = z.infer<typeof updateUserProfileBodySchema>;

/** ================================
 * List Users (Query params)
 * ================================
 */
export const listUsersQuerySchema = paginationSchema.merge(sortSchema).extend({
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  minAge: z.coerce.number().int().min(18).max(100).optional(),
  maxAge: z.coerce.number().int().min(18).max(100).optional(),
  motherTongueId: z.coerce.number().int().positive().optional(),
  religionId: z.coerce.number().int().positive().optional(),
  countryId: z.coerce.number().int().positive().optional(),
  educationDegreeId: z.coerce.number().int().positive().optional(),
  search: z.string().max(200).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

const genderPreferenceSchema = z.enum(['Male', 'Female', 'Other', 'Any']);
const maritalStatusPreferenceSchema = z.enum(['Single', 'Divorced', 'Separated', 'Widowed']);
const profilePostedBySchema = z.enum([
  'Self',
  'Parent',
  'Sibling',
  'Relative',
  'Guardian',
  'Friend',
  'Other',
]);

const idListSchema = z.array(z.coerce.number().int().positive()).optional();

export const profilePreferencesBodySchema = z
  .object({
    preferredGender: genderPreferenceSchema.optional(),
    preferredGenders: z.array(genderPreferenceSchema).optional(),
    preferredReligionIds: idListSchema,
    preferredCasteIds: idListSchema,
    preferredSubcasteIds: idListSchema,
    preferredKulamIds: idListSchema,
    preferredMotherTongueIds: idListSchema,
    preferredCountryIds: idListSchema,
    preferredStateIds: idListSchema,
    preferredCityIds: idListSchema,
    preferredEducationIds: idListSchema,
    preferredOccupationIds: idListSchema,
    preferredEmployedInIds: idListSchema,
    preferredDietIds: idListSchema,
    preferredDrinkingIds: idListSchema,
    preferredSmokingIds: idListSchema,
    preferredMaritalStatusIds: z.array(maritalStatusPreferenceSchema).optional(),
    preferredRasiIds: idListSchema,
    preferredNakshatraIds: idListSchema,
    preferredManglikStatusIds: z.array(z.enum(['Yes', 'No', 'Partial'])).optional(),
    preferredProfilePostedByIds: z.array(profilePostedBySchema).optional(),
    excludedCasteIds: idListSchema,
    excludedOccupationIds: idListSchema,
    excludedCityIds: idListSchema,
    excludedDoshaIds: z.array(z.string().min(1)).optional(),
    minAge: z.coerce.number().int().min(18).max(100).optional(),
    maxAge: z.coerce.number().int().min(18).max(100).optional(),
    minHeightId: z.coerce.number().int().positive().optional(),
    maxHeightId: z.coerce.number().int().positive().optional(),
    minSalaryId: z.coerce.number().int().positive().optional(),
    maxSalaryId: z.coerce.number().int().positive().optional(),
    preferSameReligion: z.boolean().optional(),
    preferSameCaste: z.boolean().optional(),
    preferSameSubcaste: z.boolean().optional(),
    preferSameState: z.boolean().optional(),
    preferSameCity: z.boolean().optional(),
    preferSameMotherTongue: z.boolean().optional(),
    requireHoroscopeMatch: z.boolean().optional(),
    requirePhoto: z.boolean().optional(),
    requirePhoneVerified: z.boolean().optional(),
    acceptPartnerWithChildren: z.boolean().optional(),
    preferNoChildren: z.boolean().optional(),
    maxDaysInactive: z.coerce.number().int().min(0).max(365).optional(),
    minProfileCompletion: z.coerce.number().int().min(0).max(100).optional(),
  })
  .refine(
    (value) => Object.values(value).some((item) => item !== undefined),
    { message: 'At least one preferences field is required' }
  );

export type ProfilePreferencesBody = z.infer<typeof profilePreferencesBodySchema>;

/** ================================
 * Upload Profile Picture (Body)
 * ================================
 */
export const uploadProfilePictureBodySchema = z.object({
  imageUrl: z.string().url({ message: 'Invalid image URL' }),
  isPrimary: z.boolean().default(true),
});

export type UploadProfilePictureBody = z.infer<typeof uploadProfilePictureBodySchema>;
