import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { IAuthRequest } from '../auth/auth.interfaces';
import { interestsService } from './interests.service';

const pageQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const likeParamsSchema = z.object({ likeId: z.coerce.number().int().positive() });

const accountIdOrThrow = (req: IAuthRequest) => {
  const accountId = req.account?.accountId;
  if (!accountId) throw new Error('Unauthorized');
  return accountId;
};

export const receivedInterestsController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const data = await interestsService.received(accountIdOrThrow(req), query.cursor, query.limit);
    res.status(200).json({ message: 'Received interests fetched', ...data });
  } catch (error) {
    next(error);
  }
};

export const sentInterestsController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const data = await interestsService.sent(accountIdOrThrow(req), query.cursor, query.limit);
    res.status(200).json({ message: 'Sent interests fetched', ...data });
  } catch (error) {
    next(error);
  }
};

export const interestMatchesController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = pageQuerySchema.parse(req.query);
    const data = await interestsService.matches(accountIdOrThrow(req), query.cursor, query.limit);
    res.status(200).json({ message: 'Matches fetched', ...data });
  } catch (error) {
    next(error);
  }
};

export const acceptInterestController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const params = likeParamsSchema.parse(req.params);
    const data = await interestsService.accept(accountIdOrThrow(req), params.likeId);
    res.status(200).json({ message: 'Interest accepted', data });
  } catch (error) {
    next(error);
  }
};

export const rejectInterestController = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const params = likeParamsSchema.parse(req.params);
    const data = await interestsService.reject(accountIdOrThrow(req), params.likeId);
    res.status(200).json({ message: 'Interest rejected', data });
  } catch (error) {
    next(error);
  }
};
