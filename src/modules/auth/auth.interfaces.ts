import { Request } from 'express';

export type RoleType = 'USER' | 'ADMIN' | 'STAFF';


export type OTPType = 'PhoneVerification' | 'PasswordReset' | '2FA';

export interface IAccountCreation {
  email?: string;
  phone?: string;
  password: string;
  roles: RoleType[];
  displayName?: string;
}

export interface IProfileCreation {
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
}

export interface IAccount {
  accountId: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  roles: RoleType[];
  isActive: boolean;
}

export interface IAuthRequest extends Request {
  account?: IAccount;
  role?: RoleType;
}


export interface IJwtPayload {
  accountId: string;
  role: RoleType;
  iat?: number; // issued at timestamp (optional)
  exp?: number; // expiration timestamp (optional)
}