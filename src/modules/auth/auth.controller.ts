import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { IAccountCreation, IProfileCreation, RoleType } from './auth.interfaces';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accountData: IAccountCreation = req.body.account;
    const profileData: IProfileCreation = req.body.profile;
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
