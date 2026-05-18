import { Request, Response, NextFunction } from 'express';
import { saveCardSchema, processPaymentSchema } from './payments.schema';
import * as paymentsService from './payments.service';
import { AppError } from '../../utils/AppError';

export const saveCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = saveCardSchema.parse(req.body);
    const card = await paymentsService.saveCard(req.user!.userId, input);
    res.status(201).json({ data: card });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

export const getMyCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await paymentsService.getMyCards(req.user!.userId);
    res.json({ data: cards });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = processPaymentSchema.parse(req.body);
    const result = await paymentsService.processPayment(req.user!.userId, input);
    res.json({ data: result });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};
