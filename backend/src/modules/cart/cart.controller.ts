import { Request, Response, NextFunction } from 'express';
import { addItemSchema, updateItemSchema } from './cart.schema';
import * as cartService from './cart.service';
import { AppError } from '../../utils/AppError';

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = addItemSchema.parse(req.body);
    const cart = await cartService.addItem(req.user!.userId, input.product_id, input.quantity);
    res.status(201).json({ data: cart });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = parseInt(req.params.id as string, 10);
    if (isNaN(itemId)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const input = updateItemSchema.parse(req.body);
    const cart = await cartService.updateItem(req.user!.userId, itemId, input.quantity);
    res.json({ data: cart });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const itemId = parseInt(req.params.id as string, 10);
    if (isNaN(itemId)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const cart = await cartService.removeItem(req.user!.userId, itemId);
    res.json({ data: cart });
  } catch (error) {
    next(error);
  }
};
