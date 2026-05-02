import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { IAccountCreation, IProfileCreation, RoleType } from './auth.interfaces';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const accountData: IAccountCreation = req.body.account;
    const profileData: IProfileCreation = req.body.profile;
        console.log(accountData,profileData);
    const result = await authService.registerUser(accountData, profileData);
    res.status(201).json({ message: 'User registered', data: result });
  } catch (err) {
    next(err);
  }
};

export const loginPasswordController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password, role } = req.body as { identifier: string; password: string; role: RoleType };
    const result = await authService.loginWithPassword(identifier, password, role);
    res.status(200).json({ message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};

export const loginOTPController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, otp, role } = req.body as { identifier: string; otp: string; role: RoleType };
    const result = await authService.loginWithOTP(identifier, otp, role);
    res.status(200).json({ message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};

export const checkAvailabilityController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, phone } = req.query;
    const result = await authService.checkAvailability(
      email as string | undefined,
      phone as string | undefined
    );
    res.status(200).json({ message: 'Availability checked', data: result });
  } catch (err) {
    next(err);
  }
};

export const requestLoginOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d+$/.test(phone)) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }
    const result = await authService.requestLoginOtp(phone);
    res.status(200).json({ message: 'OTP sent successfully', data: result });
  } catch (err) {
    next(err);
  }
};

export const verifyLoginOtpController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !/^\d+$/.test(phone)) {
      return res.status(400).json({ message: 'Valid phone number is required' });
    }
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Valid 6-digit OTP is required' });
    }
    const result = await authService.verifyLoginOtp(phone, otp);
    res.status(200).json({ message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};
