import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IProfile {
  profileId: string;
  accountId: string;
  fullname: string;
  profileCreatedFor: string;
  dateOfBirth: Date;
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

export class ProfileModel extends Model<IProfile, ProfileCreationAttributes> implements IProfile {
  public profileId!: string;
  public accountId!: string;
  public fullname!: string;
  public profileCreatedFor!: string;
  public dateOfBirth!: Date;
  public gender!: 'Male' | 'Female' | 'Other';
  public maritalStatus!: 'Single' | 'Divorced' | 'Separated' | 'Widowed';
  public religionId?: number;
  public sectId?: number;
  public casteId?: number;
  public subcasteId?: number;
  public kulamId?: number;
  public motherTongueId?: number;
  public countryId?: number;
  public stateId?: number;
  public cityId?: number;
  public heightId?: number;
  public weight?: number;
  public educationDegreeId?: number;
  public occupationRoleId?: number;
  public employedInId?: number;
  public expectedSalaryId?: number;
  public aboutMe?: string;
  public matrimonyModeId?: number;
  public modeSelectedAt?: Date;
  public profileStatus!: 'Active' | 'Inactive';
  public isSearchable!: boolean;
  public visibility!: 'Public' | 'Private';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ProfileModel {
  ProfileModel.init(
    {
      profileId: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, field: 'profile_id' },
      accountId: { type: DataTypes.UUID, allowNull: false, field: 'account_id' },
      fullname: { type: DataTypes.STRING(150), allowNull: false },
      profileCreatedFor: { type: DataTypes.STRING(50), allowNull: false, field: 'profile_created_for' },
      dateOfBirth: { type: DataTypes.DATEONLY, allowNull: false, field: 'date_of_birth' },
      gender: { type: DataTypes.ENUM('Male', 'Female', 'Other'), allowNull: false },
      maritalStatus: { type: DataTypes.ENUM('Single', 'Divorced', 'Separated', 'Widowed'), allowNull: false, field: 'marital_status' },
      religionId: { type: DataTypes.INTEGER, field: 'religion_id' },
      sectId: { type: DataTypes.INTEGER, field: 'sect_id' },
      casteId: { type: DataTypes.INTEGER, field: 'caste_id' },
      subcasteId: { type: DataTypes.INTEGER, field: 'subcaste_id' },
      kulamId: { type: DataTypes.INTEGER, field: 'kulam_id' },
      motherTongueId: { type: DataTypes.INTEGER, field: 'mother_tongue_id' },
      countryId: { type: DataTypes.INTEGER, field: 'country_id' },
      stateId: { type: DataTypes.INTEGER, field: 'state_id' },
      cityId: { type: DataTypes.INTEGER, field: 'city_id' },
      heightId: { type: DataTypes.INTEGER, field: 'height_id' },
      weight: { type: DataTypes.FLOAT },
      educationDegreeId: { type: DataTypes.INTEGER, field: 'education_degree_id' },
      occupationRoleId: { type: DataTypes.INTEGER, field: 'occupation_role_id' },
      employedInId: { type: DataTypes.INTEGER, field: 'employedin_id' },
      expectedSalaryId: { type: DataTypes.INTEGER, field: 'expected_salary_id' },
      aboutMe: { type: DataTypes.TEXT, field: 'about_me' },
      matrimonyModeId: { type: DataTypes.INTEGER, allowNull: true, field: 'matrimony_mode_id' },
      modeSelectedAt: { type: DataTypes.DATE, allowNull: true, field: 'mode_selected_at' },
      profileStatus: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active', field: 'profile_status' },
      isSearchable: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_searchable' },
      visibility: { type: DataTypes.ENUM('Public', 'Private'), defaultValue: 'Public' },
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
