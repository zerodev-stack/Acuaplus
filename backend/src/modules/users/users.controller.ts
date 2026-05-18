import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError';
import * as usersService from './users.service';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.getUserById(req.user!.userId);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowedFields = ['name', 'phone', 'avatar_url'];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      throw new AppError(400, 'No hay campos válidos para actualizar', 'NO_FIELDS');
    }
    const user = await usersService.updateUser(req.user!.userId, updates);
    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const getPendingSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await usersService.getPendingSellers();
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const approveSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const result = await usersService.approveSeller(userId, req.user!.userId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id as string, 10);
    if (isNaN(userId)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const result = await usersService.suspendUser(userId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
