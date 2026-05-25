import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IProfile {
  profileId: string;
  accountId: string;
  fullname: string;
  profileCreatedFor: string;
  dateOfBirth: Date;        // stores date + time
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Divorced' | 'Separated' | 'Widowed';
  religionId?: number;
  sectId?: number;
  casteId?: number;
  subcasteId?: number;
  kulamId?: number;
  motherTongueId?: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  heightId?: number;
  weight?: number;
  educationDegreeId?: number;
  occupationRoleId?: number;
  employedInId?: number;
  expectedSalaryId?: number;
  aboutMe?: string;
  matrimonyModeId?: number;
  modeSelectedAt?: Date;
  profileStatus: 'Active' | 'Inactive';
  isSearchable: boolean;
  visibility: 'Public' | 'Private';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProfileCreationAttributes = Optional<
  IProfile,
  | 'profileId'
  | 'religionId'
  | 'sectId'
  | 'casteId'
  | 'subcasteId'
  | 'kulamId'
  | 'motherTongueId'
  | 'countryId'
  | 'stateId'
  | 'cityId'
  | 'heightId'
  | 'weight'
  | 'educationDegreeId'
  | 'occupationRoleId'
  | 'employedInId'
  | 'expectedSalaryId'
  | 'aboutMe'
  | 'matrimonyModeId'
  | 'modeSelectedAt'
  | 'profileStatus'
  | 'isSearchable'
  | 'visibility'
  | 'createdAt'
  | 'updatedAt'
>;

export class ProfileModel
  extends Model<IProfile, ProfileCreationAttributes>
  implements IProfile
{
  declare profileId: string;
  declare accountId: string;
  declare fullname: string;
  declare profileCreatedFor: string;
  declare dateOfBirth: Date;
  declare gender: 'Male' | 'Female' | 'Other';
  declare maritalStatus: 'Single' | 'Divorced' | 'Separated' | 'Widowed';
  declare religionId?: number;
  declare sectId?: number;
  declare casteId?: number;
  declare subcasteId?: number;
  declare kulamId?: number;
  declare motherTongueId?: number;
  declare countryId?: number;
  declare stateId?: number;
  declare cityId?: number;
  declare heightId?: number;
  declare weight?: number;
  declare educationDegreeId?: number;
  declare occupationRoleId?: number;
  declare employedInId?: number;
  declare expectedSalaryId?: number;
  declare aboutMe?: string;
  declare matrimonyModeId?: number;
  declare modeSelectedAt?: Date;
  declare profileStatus: 'Active' | 'Inactive';
  declare isSearchable: boolean;
  declare visibility: 'Public' | 'Private';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize): typeof ProfileModel {
  ProfileModel.init(
    {
      profileId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'profile_id',
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'account_id',
      },
      fullname: { type: DataTypes.STRING(150), allowNull: false },
      profileCreatedFor: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'profile_created_for',
      },

      // ✅ Changed from DATEONLY → DATE to store date + birth time
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'date_of_birth',
      },

      gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
      maritalStatus: {
        type: DataTypes.ENUM('Single', 'Divorced', 'Separated', 'Widowed'),
        allowNull: false,
        field: 'marital_status',
      },
      religionId: { type: DataTypes.INTEGER, allowNull: true, field: 'religion_id' },
      sectId: { type: DataTypes.INTEGER, allowNull: true, field: 'sect_id' },
      casteId: { type: DataTypes.INTEGER, allowNull: true, field: 'caste_id' },
      subcasteId: { type: DataTypes.INTEGER, allowNull: true, field: 'subcaste_id' },
      kulamId: { type: DataTypes.INTEGER, allowNull: true, field: 'kulam_id' },
      motherTongueId: { type: DataTypes.INTEGER, allowNull: true, field: 'mother_tongue_id' },
      countryId: { type: DataTypes.INTEGER, allowNull: true, field: 'country_id' },
      stateId: { type: DataTypes.INTEGER, allowNull: true, field: 'state_id' },
      cityId: { type: DataTypes.INTEGER, allowNull: true, field: 'city_id' },
      heightId: { type: DataTypes.INTEGER, allowNull: true, field: 'height_id' },
      weight: { type: DataTypes.FLOAT, allowNull: true },
      educationDegreeId: { type: DataTypes.INTEGER, allowNull: true, field: 'education_degree_id' },
      occupationRoleId: { type: DataTypes.INTEGER, allowNull: true, field: 'occupation_role_id' },
      employedInId: { type: DataTypes.INTEGER, allowNull: true, field: 'employedin_id' },
      expectedSalaryId: { type: DataTypes.INTEGER, allowNull: true, field: 'expected_salary_id' },
      aboutMe: { type: DataTypes.TEXT, allowNull: true, field: 'about_me' },
      matrimonyModeId: { type: DataTypes.INTEGER, allowNull: true, field: 'matrimony_mode_id' },
      modeSelectedAt: { type: DataTypes.DATE, allowNull: true, field: 'mode_selected_at' },
      profileStatus: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
        field: 'profile_status',
      },
      isSearchable: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_searchable' },
      visibility: {
        type: DataTypes.ENUM('Public', 'Private'),
        defaultValue: 'Public',
      },
    },
    {
      sequelize,
      tableName: 'profiles',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ProfileModel;
}