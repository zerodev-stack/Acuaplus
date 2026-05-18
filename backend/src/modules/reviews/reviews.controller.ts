import { Request, Response, NextFunction } from 'express';
import { createReviewSchema } from './reviews.schema';
import * as reviewsService from './reviews.service';
import { AppError } from '../../utils/AppError';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createReviewSchema.parse(req.body);
    const review = await reviewsService.createReview(req.user!.userId, input);
    res.status(201).json({ data: review });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt((req.params.productId || req.params.id) as string, 10);
    if (isNaN(productId)) throw new AppError(400, 'ID de producto inválido', 'INVALID_ID');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await reviewsService.getProductReviews(productId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
