import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IProfilePreferences {
  profileId: string;
  minAge?: number;
  maxAge?: number;
  minHeightId?: number;
  maxHeightId?: number;
  minSalaryId?: number;
  maxSalaryId?: number;
  preferredReligionIds?: number[];
  preferredCasteIds?: number[];
  preferredSubcasteIds?: number[];
  preferredKulamIds?: number[];
  preferredMotherTongueIds?: number[];
  preferredCountryIds?: number[];
  preferredStateIds?: number[];
  preferredCityIds?: number[];
  preferredEducationIds?: number[];
  preferredOccupationIds?: number[];
  preferredEmployedInIds?: number[];
  preferredDietIds?: number[];
  preferredDrinkingIds?: number[];
  preferredSmokingIds?: number[];
  preferredMaritalStatusIds?: string[];
  preferredRasiIds?: number[];
  preferredNakshatraIds?: number[];
  preferredManglikStatusIds?: string[];
  preferredProfilePostedByIds?: string[];
  excludedCasteIds?: number[];
  excludedOccupationIds?: number[];
  excludedCityIds?: number[];
  excludedDoshaIds?: string[];
  preferSameReligion?: boolean;
  preferSameCaste?: boolean;
  preferSameSubcaste?: boolean;
  preferSameState?: boolean;
  preferSameCity?: boolean;
  preferSameMotherTongue?: boolean;
  requireHoroscopeMatch?: boolean;
  requirePhoto?: boolean;
  requirePhoneVerified?: boolean;
  acceptPartnerWithChildren?: boolean;
  preferNoChildren?: boolean;
  maxDaysInactive?: number;
  minProfileCompletion?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProfilePreferencesCreationAttributes = Optional<
  IProfilePreferences,
  | 'minAge'
  | 'maxAge'
  | 'minHeightId'
  | 'maxHeightId'
  | 'minSalaryId'
  | 'maxSalaryId'
  | 'preferredReligionIds'
  | 'preferredCasteIds'
  | 'preferredSubcasteIds'
  | 'preferredKulamIds'
  | 'preferredMotherTongueIds'
  | 'preferredCountryIds'
  | 'preferredStateIds'
  | 'preferredCityIds'
  | 'preferredEducationIds'
  | 'preferredOccupationIds'
  | 'preferredEmployedInIds'
  | 'preferredDietIds'
  | 'preferredDrinkingIds'
  | 'preferredSmokingIds'
  | 'preferredMaritalStatusIds'
  | 'preferredRasiIds'
  | 'preferredNakshatraIds'
  | 'preferredManglikStatusIds'
  | 'preferredProfilePostedByIds'
  | 'excludedCasteIds'
  | 'excludedOccupationIds'
  | 'excludedCityIds'
  | 'excludedDoshaIds'
  | 'preferSameReligion'
  | 'preferSameCaste'
  | 'preferSameSubcaste'
  | 'preferSameState'
  | 'preferSameCity'
  | 'preferSameMotherTongue'
  | 'requireHoroscopeMatch'
  | 'requirePhoto'
  | 'requirePhoneVerified'
  | 'acceptPartnerWithChildren'
  | 'preferNoChildren'
  | 'maxDaysInactive'
  | 'minProfileCompletion'
  | 'createdAt'
  | 'updatedAt'
>;

export class ProfilePreferencesModel
  extends Model<IProfilePreferences, ProfilePreferencesCreationAttributes>
  implements IProfilePreferences
{
  declare profileId: string;
  declare minAge?: number;
  declare maxAge?: number;
  declare minHeightId?: number;
  declare maxHeightId?: number;
  declare minSalaryId?: number;
  declare maxSalaryId?: number;
  declare preferredReligionIds?: number[];
  declare preferredCasteIds?: number[];
  declare preferredSubcasteIds?: number[];
  declare preferredKulamIds?: number[];
  declare preferredMotherTongueIds?: number[];
  declare preferredCountryIds?: number[];
  declare preferredStateIds?: number[];
  declare preferredCityIds?: number[];
  declare preferredEducationIds?: number[];
  declare preferredOccupationIds?: number[];
  declare preferredEmployedInIds?: number[];
  declare preferredDietIds?: number[];
  declare preferredDrinkingIds?: number[];
  declare preferredSmokingIds?: number[];
  declare preferredMaritalStatusIds?: string[];
  declare preferredRasiIds?: number[];
  declare preferredNakshatraIds?: number[];
  declare preferredManglikStatusIds?: string[];
  declare preferredProfilePostedByIds?: string[];
  declare excludedCasteIds?: number[];
  declare excludedOccupationIds?: number[];
  declare excludedCityIds?: number[];
  declare excludedDoshaIds?: string[];
  declare preferSameReligion?: boolean;
  declare preferSameCaste?: boolean;
  declare preferSameSubcaste?: boolean;
  declare preferSameState?: boolean;
  declare preferSameCity?: boolean;
  declare preferSameMotherTongue?: boolean;
  declare requireHoroscopeMatch?: boolean;
  declare requirePhoto?: boolean;
  declare requirePhoneVerified?: boolean;
  declare acceptPartnerWithChildren?: boolean;
  declare preferNoChildren?: boolean;
  declare maxDaysInactive?: number;
  declare minProfileCompletion?: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize): typeof ProfilePreferencesModel {
  ProfilePreferencesModel.init(
    {
      profileId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        field: 'profile_id',
        references: {
          model: 'profiles',
          key: 'profile_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      minAge: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 18, field: 'min_age' },
      maxAge: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60, field: 'max_age' },
      minHeightId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'min_height_id',
        references: {
          model: 'height_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      maxHeightId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_height_id',
        references: {
          model: 'height_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      minSalaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'min_salary_id',
        references: {
          model: 'salary_range_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      maxSalaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'max_salary_id',
        references: {
          model: 'salary_range_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      preferredReligionIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_religion_ids' },
      preferredCasteIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_caste_ids' },
      preferredSubcasteIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_subcaste_ids' },
      preferredKulamIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_kulam_ids' },
      preferredMotherTongueIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_mother_tongue_ids',
      },
      preferredCountryIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_country_ids' },
      preferredStateIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_state_ids' },
      preferredCityIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_city_ids' },
      preferredEducationIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_education_ids' },
      preferredOccupationIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_occupation_ids',
      },
      preferredEmployedInIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_employed_in_ids',
      },
      preferredDietIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_diet_ids' },
      preferredDrinkingIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_drinking_ids' },
      preferredSmokingIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_smoking_ids' },
      preferredMaritalStatusIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_marital_status_ids',
      },
      preferredRasiIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_rasi_ids' },
      preferredNakshatraIds: { type: DataTypes.JSON, allowNull: true, field: 'preferred_nakshatra_ids' },
      preferredManglikStatusIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_manglik_status_ids',
      },
      preferredProfilePostedByIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'preferred_profile_posted_by_ids',
      },
      excludedCasteIds: { type: DataTypes.JSON, allowNull: true, field: 'excluded_caste_ids' },
      excludedOccupationIds: { type: DataTypes.JSON, allowNull: true, field: 'excluded_occupation_ids' },
      excludedCityIds: { type: DataTypes.JSON, allowNull: true, field: 'excluded_city_ids' },
      excludedDoshaIds: { type: DataTypes.JSON, allowNull: true, field: 'excluded_dosha_ids' },
      preferSameReligion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_same_religion',
      },
      preferSameCaste: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_same_caste',
      },
      preferSameSubcaste: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_same_subcaste',
      },
      preferSameState: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_same_state',
      },
      preferSameCity: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_same_city',
      },
      preferSameMotherTongue: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_same_mother_tongue',
      },
      requireHoroscopeMatch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'require_horoscope_match',
      },
      requirePhoto: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'require_photo',
      },
      requirePhoneVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'require_phone_verified',
      },
      acceptPartnerWithChildren: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'accept_partner_with_children',
      },
      preferNoChildren: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'prefer_no_children',
      },
      maxDaysInactive: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        field: 'max_days_inactive',
      },
      minProfileCompletion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        field: 'min_profile_completion',
      },
    },
    {
      sequelize,
      tableName: 'profile_preferences',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  return ProfilePreferencesModel;
}
