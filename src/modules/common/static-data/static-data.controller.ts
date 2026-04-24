// Matrimony-Backend/src/modules/common/static-data/static-data.controller.ts
import { Request, Response, NextFunction } from 'express';
import { getStaticDataService } from './static-data.service';

export const getStaticDataController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getStaticDataService();
    res.status(200).json({ message: 'Static data fetched', data });
  } catch (error) {
    next(error);
  }
};
