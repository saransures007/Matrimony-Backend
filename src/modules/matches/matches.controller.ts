import { Request, Response, NextFunction } from 'express';
import { matchesService } from './matches.service';
import { IAuthRequest } from '../auth/auth.interfaces';

export const getMatchesController = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const accountId = req.account?.accountId;
    if (!accountId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const matches = await matchesService.getMatchesForUser(accountId);
    res.status(200).json({ message: 'Matches fetched', data: matches });
  } catch (error) {
    next(error);
  }
};
