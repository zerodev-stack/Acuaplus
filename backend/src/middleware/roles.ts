import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'No autenticado', 'UNAUTHORIZED'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'No tienes permisos para esta acción', 'FORBIDDEN'));
      return;
    }

    next();
  };
};
