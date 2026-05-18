import { Request, Response, NextFunction } from 'express';
import * as categoriesService from './categories.service';

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoriesService.getAllActive();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
};
