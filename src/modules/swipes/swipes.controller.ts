import { NextFunction, Response } from 'express';
import { IAuthRequest } from '../auth/auth.interfaces';
import { nextProfilesQuerySchema, profileDetailsParamsSchema, swipeActionSchema } from './swipes.validator';
import { swipesService } from './swipes.service';

const accountIdOrThrow = (req: IAuthRequest) => {
  const accountId = req.account?.accountId;
  if (!accountId) throw new Error('Unauthorized');
  return accountId;
};

export const nextProfilesController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = nextProfilesQuerySchema.parse(req.query);
    const data = await swipesService.nextProfiles(accountIdOrThrow(req), query.cursor, query.limit);
    res.status(200).json({ message: 'Next profiles fetched', ...data });
  } catch (error) {
    next(error);
  }
};

export const profileDetailsController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const params = profileDetailsParamsSchema.parse(req.params);
    const data = await swipesService.profileDetails(accountIdOrThrow(req), params.profileId);
    res.status(200).json({ message: 'Profile fetched', data });
  } catch (error) {
    next(error);
  }
};

export const swipeController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = swipeActionSchema.parse(req.body);
    const data = await swipesService.swipe(accountIdOrThrow(req), body.targetProfileId, body.action);
    res.status(201).json({ message: 'Swipe recorded', data });
  } catch (error) {
    next(error);
  }
};
