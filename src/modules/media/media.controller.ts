import { NextFunction, Response } from 'express';
import { IAuthRequest } from '../auth/auth.interfaces';
import { mediaService } from './media.service';
import {
  completeProfilePicturesSchema,
  presignProfilePicturesSchema,
  profilePictureVerificationStatusQuerySchema,
  rollbackProfilePicturesSchema,
  submitProfilePictureVerificationSchema,
} from './media.validator';

const accountIdOrThrow = (req: IAuthRequest) => {
  const accountId = req.account?.accountId;
  if (!accountId) throw new Error('Unauthorized');
  return accountId;
};

export const presignProfilePicturesController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = presignProfilePicturesSchema.parse(req.body);
    const data = await mediaService.presignProfilePictures(accountIdOrThrow(req), body.files);
    res.status(201).json({ message: 'Upload URLs created', data });
  } catch (error) {
    next(error);
  }
};

export const listProfilePicturesController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await mediaService.listProfilePictures(accountIdOrThrow(req));
    res.status(200).json({ message: 'Profile pictures fetched', data });
  } catch (error) {
    next(error);
  }
};

export const completeProfilePicturesController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = completeProfilePicturesSchema.parse(req.body);
    const data = await mediaService.completeProfilePictures(accountIdOrThrow(req), body.uploads);
    res.status(201).json({ message: 'Profile pictures saved', data });
  } catch (error) {
    next(error);
  }
};

export const rollbackProfilePicturesController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = rollbackProfilePicturesSchema.parse(req.body);
    const data = await mediaService.rollbackProfilePictures(accountIdOrThrow(req), body.storageKeys);
    res.status(200).json({ message: 'Upload rollback completed', data });
  } catch (error) {
    next(error);
  }
};

export const deleteProfilePictureController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const pictureId = Number(req.params.pictureId);
    const data = await mediaService.deleteProfilePicture(accountIdOrThrow(req), pictureId);
    res.status(200).json({ message: 'Profile picture deleted', data });
  } catch (error) {
    next(error);
  }
};

export const profilePictureVerificationStatusController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    profilePictureVerificationStatusQuerySchema.parse(req.query);
    const data = await mediaService.profilePictureVerificationStatus(accountIdOrThrow(req));
    res.status(200).json({ message: 'Photo verification status fetched', data });
  } catch (error) {
    next(error);
  }
};

export const submitProfilePictureVerificationController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = submitProfilePictureVerificationSchema.parse(req.body);
    const data = await mediaService.submitProfilePictureVerification(accountIdOrThrow(req), body);
    res.status(200).json({ message: 'Photo verification submitted', data });
  } catch (error) {
    next(error);
  }
};
