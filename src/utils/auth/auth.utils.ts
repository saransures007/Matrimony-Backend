// Matrimony-Backend/src/modules/auth/auth.utils.ts

import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import bcrypt from 'bcrypt';
import { IJwtPayload } from '../../modules/auth/auth.interfaces';
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'supersecret';
const SALT_ROUNDS = 10;

/**
 * Hash a plain password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain password with hashed password
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateJwt = (payload: IJwtPayload, expiresIn: StringValue): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
};


/**
 * Verify JWT token and return decoded payload
 */
export const verifyJwt = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};


/**
 * Generate 6-digit numeric OTP
 */
export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
