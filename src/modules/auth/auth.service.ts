// import { IUser } from '@/interfaces/user.interfaces';
// import { validateSignIn, validateSignUp } from './auth.validator';
// import repo from './auth.repo';
// import {generateOtpAndTokenHash, sendOtpSms} from '@/utils/otp.utils';
// import { compareSync, hash } from 'bcrypt';
// import { generateJWT, verifyJWT } from '@/middlewares/jwt.service';
// import { JWT_ACCESS_TOKEN_SECRET, SMS_SECRET_TOKEN, JWT_REFRESH_TOKEN_SECRET} from '@/config';
// import { CustomError, } from '@/utils/custom-error';
// import createHttpError from "http-errors";
// import { createHmac } from "crypto";

// export const signUpService = async (userData: IUser) => {
//     const { error } = validateSignUp(userData);
//     if (error) {
//         throw new CustomError(error.details[0].message, 400);
//     }

//     const findUser = await repo.findUserByEmail(userData.email);
//     if (findUser) {
//         throw new CustomError(`Email ${userData.email} already exists`, 409);
//     }

//     const randomId = (Date.now() + Math.floor(Math.random() * 100)).toString(
//         36,
//     );
//     const username = `${userData.email.split('@')[0]}-${randomId}`;
//     const hashedPassword = await hash(userData.password, 10);
//     const newUserData = await repo.createUser({
//         ...userData,
//         username,
//         password: hashedPassword,
//     });

//     return { user: newUserData };
// };

// export const signInService = async (userData: IUser) => {
//     const { error } = validateSignIn(userData);
//     if (error) {
//         throw new CustomError(error.details[0].message, 400);
//     }

//     const user = await repo.findUserByEmail(userData.email);
//     if (!user) {
//         throw new CustomError('Email or password is invalid', 401);
//     }

//     const validPassword = compareSync(userData.password, user.password);
//     if (!validPassword) {
//         throw new CustomError('Email or password is invalid', 401);
//     }

//     const payload = {
//         userId: user.userId,
//     };

//     const accessToken = await generateJWT(
//         payload,
//         JWT_ACCESS_TOKEN_SECRET as string,
//     );

//     return { user, accessToken };
// };

// /**
//  * Service: Request OTP (via Twilio SMS)
//  */
// export const requestOtpService = async (phoneNumber: string) => {
//   const result = await generateOtpAndTokenHash(phoneNumber);
//   if (!result) throw createHttpError(500, "Failed to generate OTP");

//   const { otp, xMagicToken } = result;

//   await sendOtpSms(phoneNumber, otp);

//   return {
//     message: "OTP sent successfully",
//     xMagicToken, // send to client for OTP verification
//   };
// };

// /**
//  * Service: Verify OTP
//  */
// export const verifyOtpService = async (
//   phoneNumber: string,
//   otp: string,
//   xMagicToken: string
// ) => {
//   const [hash, expiresAt] = xMagicToken.split(".");
//   if (Date.now() > parseInt(expiresAt)) {
//     throw createHttpError(400, "OTP expired");
//   }

//   const data = `${phoneNumber}.${otp}.${expiresAt}`;
//   const newHash = createHmac("sha256", SMS_SECRET_TOKEN ? SMS_SECRET_TOKEN : "" )
//     .update(data)
//     .digest("hex");

//   if (newHash !== hash) {
//     throw createHttpError(400, "Invalid OTP");
//   }

//   // TODO: fetch/create user in DB by phoneNumber
//   const user = { id: "123", phoneNumber };

//   const accessToken = await generateJWT(
//         { userId: user.id, phoneNumber },
//         JWT_ACCESS_TOKEN_SECRET as string,
//     );

//     const refreshToken = await generateJWT(
//         { userId: user.id, phoneNumber },
//         JWT_REFRESH_TOKEN_SECRET as string,
//     );

//   return { user, accessToken, refreshToken };
// };
// /**
//  * Service: Refresh Token
//  */
// export const refreshTokenService = async (refreshToken: string) => {
//   try {
//     if (!refreshToken) throw createHttpError(401, "No refresh token provided");

//     const cleanedToken = refreshToken.replace("Bearer ", "");

//     // Validate refresh token
//         const decoded = await verifyJWT(
//             refreshToken,
//             JWT_REFRESH_TOKEN_SECRET as string, 
//         );
//     // Issue new access token
//     const newAccessToken = await generateJWT(
//       { userId: decoded.userId, phoneNumber: decoded.phoneNumber },
//       JWT_ACCESS_TOKEN_SECRET as string,
//     );

//     return { accessToken: newAccessToken };
//   } catch (error: any) {
//     throw createHttpError(401, error.message);
//   }
// };
import { authRepo } from './auth.repo';
import { IAccountCreation, IProfileCreation, RoleType } from './auth.interfaces';
import { DB } from '@/database';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { generateJwt } from '@/utils/auth/auth.utils';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES = '7d';

export const authService = {
  registerUser: async (accountData: IAccountCreation, profileData: IProfileCreation) => {
    const t = await DB.sequelize.transaction();
    try {
      const accountId = await authRepo.createAccount(accountData, t);
      profileData.accountId = accountId;
      const profileId = await authRepo.createProfile(profileData, t);

      await t.commit();

      const token = generateJwt({ accountId, role: 'USER' }, JWT_EXPIRES);
      return { accountId, profileId, token };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  loginWithPassword: async (identifier: string, password: string, role: RoleType) => {
    let account = identifier.includes('@')
      ? await authRepo.getAccountByEmail(identifier)
      : /^\d+$/.test(identifier)
        ? await authRepo.getAccountByPhone(identifier)
        : await authRepo.getAccountByUsername(identifier);

    if (!account) throw new Error('Account not found');

    console.log("account", account);
    const validPassword = await authRepo.verifyPassword(account.accountId, password);
    if (!validPassword) throw new Error('Invalid credentials');

    if (!account.roles.includes(role)) throw new Error('Unauthorized role');

    const token = jwt.sign({ accountId: account.accountId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return { token };
  },

  loginWithOTP: async (phoneOrEmail: string, otp: string, role: RoleType) => {
    let account = phoneOrEmail.includes('@')
      ? await authRepo.getAccountByEmail(phoneOrEmail)
      : await authRepo.getAccountByPhone(phoneOrEmail);

    if (!account) throw new Error('Account not found');

    const isVerified = await authRepo.verifyOTP(account.accountId, otp, 'PhoneVerification');
    if (!isVerified) throw new Error('OTP invalid or expired');

    if (!account.roles.includes(role)) throw new Error('Unauthorized role');

    const token = jwt.sign({ accountId: account.accountId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return { token };
  },

  requestOtp: async (accountId: string, phoneNumber: string, otp: string, expiresAt: Date) => {
    const t = await DB.sequelize.transaction();
    try {
      await authRepo.storeOTP(accountId, phoneNumber, otp, 'PhoneVerification', expiresAt, t);
      await t.commit();
      // send SMS outside transaction
      return { message: 'OTP stored successfully' };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  requestLoginOtp: async (phoneNumber: string) => {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 5 * 60 * 1000; // 5 minutes for login OTP
    const expiresAt = new Date(Date.now() + ttl);

    // Check if account exists
    const account = await authRepo.getAccountByPhone(phoneNumber);
    
    console.log("account:")
    // Store OTP (accountId is optional for login OTP)
    const t = await DB.sequelize.transaction();
    try {
      await authRepo.storeOTP(
        account?.accountId || '', 
        phoneNumber, 
        otp, 
        'Login', 
        expiresAt, 
        t
      );
      await t.commit();

      console.log("sending otp..")
      
      // Send SMS via Twilio
      const { sendOtpSms } = await import('@/middlewares/otp.service');
      if (process.env.NODE_ENV === "development") {
        console.log(`OTP for ${phoneNumber}: ${otp}`);
      } else {
        await sendOtpSms(phoneNumber, otp);
      }
      
      return { message: 'OTP sent successfully', expiresAt };
} catch (err: any) {
  console.error("FULL ERROR:", err);
  console.error("SQL MESSAGE:", err?.parent?.sqlMessage);
  console.error("SQL:", err?.parent?.sql);
  await t.rollback();
  throw err;
}
    
  },

  verifyLoginOtp: async (phoneNumber: string, otp: string) => {
    const t = await DB.sequelize.transaction();
    try {

      let isValid = true;

      if (process.env.NODE_ENV === "development") {
          isValid = true;
      } else {
         isValid = await authRepo.verifyOTPByPhone(phoneNumber, otp, 'Login', t);
      }
      // const isValid = await authRepo.verifyOTPByPhone(phoneNumber, otp, 'Login', t);
      
      if (!isValid) {
        await t.rollback();
        throw new Error('Invalid or expired OTP');
      }
      
      await t.commit();
      
      // Get or create account for this phone
      let account = await authRepo.getAccountByPhone(phoneNumber);
      
      if (!account) {
        // Create new account with OTP login
        const accountId = crypto.randomUUID();
        const displayName = phoneNumber;
        // Generate a random password hash for accounts created via OTP
        const tempPasswordHash = await bcrypt.hash(crypto.randomUUID(), 10);
        
        const newAccount = await DB.accounts.create({
          accountId,
          primaryPhone: phoneNumber,
          displayName,
          passwordHash: tempPasswordHash,
          isActive: true,
        });
        
        // Assign USER role
        const userRole = await DB.roles.findOne({ where: { name: 'USER' } });
        if (userRole) {
          await DB.account_roles.create({
            accountId: accountId,
            roleId: userRole.roleId,
          });
        }
        
        account = {
          accountId,
          phone: phoneNumber,
          email: undefined,
          passwordHash: tempPasswordHash,
          isActive: true,
          roles: ['USER'],
        };
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { accountId: account.accountId, role: 'USER' as RoleType }, 
        JWT_SECRET, 
        { expiresIn: JWT_EXPIRES }
      );
      
      return { token, accountId: account.accountId };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  verifyOtp: async (accountId: string, otp: string) => {
    const t = await DB.sequelize.transaction();
    try {
      const isValid = await authRepo.verifyOTP(accountId, otp, 'PhoneVerification', t);
      await t.commit();
      return isValid;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  generateJWT: (accountId: string, role: RoleType) => {
    return jwt.sign({ accountId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  },

  checkAvailability: async (email?: string, phone?: string) => {
    const result: { email?: { available: boolean }; phone?: { available: boolean } } = {};

    if (email) {
      const emailExists = await authRepo.checkEmailExists(email);
      result.email = { available: !emailExists };
    }

    if (phone) {
      const phoneExists = await authRepo.checkPhoneExists(phone);
      result.phone = { available: !phoneExists };
    }

    return result;
  },
};
