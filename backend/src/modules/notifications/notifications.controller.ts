import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError';
import * as notificationsService from './notifications.service';

export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await notificationsService.getUserNotifications(req.user!.userId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) throw new AppError(400, 'ID inválido', 'INVALID_ID');
    const result = await notificationsService.markAsRead(id, req.user!.userId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
