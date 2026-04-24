import { DB } from '@/database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { IAccountCreation, IProfileCreation, IAccount, OTPType, RoleType } from './auth.interfaces';
import createHttpError from 'http-errors';
export interface IAuthRepo {
  createAccount(accountData: IAccountCreation, t?: any): Promise<string>;
  createProfile(profileData: IProfileCreation, t?: any): Promise<string>;
  getAccountByEmail(email: string): Promise<IAccount | null>;
  getAccountByPhone(phone: string): Promise<IAccount | null>;
  getAccountByUsername(username: string): Promise<IAccount | null>;
  verifyPassword(accountId: string, password: string): Promise<boolean>;
  storeOTP(accountId: string, otp: string, type: OTPType, expiresAt: Date, t?: any): Promise<void>;
  verifyOTP(accountId: string, otp: string, type: OTPType, t?: any): Promise<boolean>;
}

export const authRepo: IAuthRepo = {
  createAccount: async (data: IAccountCreation, t?: any) => {
      // 1️⃣ Check if email already exists
    const existingEmail = await DB.accounts.findOne({ where: { primaryEmail: data.email }, transaction: t });
    if (existingEmail) throw createHttpError(409, `Email ${data.email} already exists`);

    // 2️⃣ Check if phone already exists
    if (data.phone) {
      const existingPhone = await DB.accounts.findOne({ where: { primaryPhone: data.phone }, transaction: t });
      if (existingPhone) throw createHttpError(409, `Phone ${data.phone} already exists`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const account = await DB.accounts.create({
      accountId: crypto.randomUUID(),
      primaryEmail: data.email,
      primaryPhone: data.phone,
      passwordHash: hashedPassword,
      displayName: data.displayName ?? data.email ?? data.phone,
      isActive: true,
    }, { transaction: t });

    if (data.roles?.length) {
      for (const roleName of data.roles) {
        const roleObj = await DB.roles.findOne({ where: { name: roleName }, transaction: t });
        if (roleObj) {
          await DB.account_roles.create({
            accountId: account.accountId,
            roleId: roleObj.roleId,
          }, { transaction: t });
        }
      }
    }

    return account.accountId;
  },

  createProfile: async (data: IProfileCreation, t?: any) => {
    const profile = await DB.profiles.create({
      profileId: crypto.randomUUID(),
      ...data,
      profileStatus: 'Active',
      isSearchable: true,
      visibility: 'Public',
    }, { transaction: t });
    return profile.profileId;
  },

  getAccountByEmail: async (email: string): Promise<IAccount | null> => {
    const account = await DB.accounts.findOne({
      where: { primaryEmail: email },
      include: [{ model: DB.roles, as: 'roles', through: { attributes: [] } }],
    });



    if (!account) return null;

    console.log("getAccountByEmail", account);
    return {
      accountId: account.accountId,
      email: account.primaryEmail,
      phone: account.primaryPhone,
      passwordHash: account.passwordHash,
      isActive: account.isActive,
      roles: account.roles?.map((r: any) => r.name as RoleType) ?? [],
    };
  },

  getAccountByPhone: async (phone: string): Promise<IAccount | null> => {
    const account = await DB.accounts.findOne({
      where: { primaryPhone: phone },
      include: [{ model: DB.roles, through: { attributes: [] } }],
    });
    if (!account) return null;

    return {
      accountId: account.accountId,
      email: account.primaryEmail,
      phone: account.primaryPhone,
      passwordHash: account.passwordHash,
      isActive: account.isActive,
      roles: account.roles?.map((r: any) => r.name as RoleType) ?? [],
    };
  },

  getAccountByUsername: async (username: string): Promise<IAccount | null> => {
    const account = await DB.accounts.findOne({
      where: { displayName: username },
      include: [{ model: DB.roles, through: { attributes: [] } }],
    });
    if (!account) return null;

    return {
      accountId: account.accountId,
      email: account.primaryEmail,
      phone: account.primaryPhone,
      passwordHash: account.passwordHash,
      isActive: account.isActive,
      roles: account.roles?.map((r: any) => r.name as RoleType) ?? [],
    };
  },

  verifyPassword: async (accountId: string, password: string): Promise<boolean> => {
    const account = await DB.accounts.findByPk(accountId);
    if (!account) return false;
    return bcrypt.compare(password, account.passwordHash);
  },

  storeOTP: async (accountId: string, otp: string, type: OTPType, expiresAt: Date, t?: any) => {
    await DB.otp_verification.create({ accountId, otpCode: otp, type, isUsed: false, expiresAt }, { transaction: t });
  },

  verifyOTP: async (accountId: string, otp: string, type: OTPType, t?: any): Promise<boolean> => {
    const otpRecord = await DB.otp_verification.findOne({
      where: { accountId, otpCode: otp, type, isUsed: false },
      transaction: t,
    });
    if (!otpRecord) return false;
    if (new Date() > otpRecord.expiresAt) return false;
    await otpRecord.update({ isUsed: true }, { transaction: t });
    return true;
  },
};
