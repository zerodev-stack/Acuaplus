import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { query } from '../config/db';
import { UserRow } from '../types';

declare module 'express' {
  interface Request {
    user?: JwtPayload & { userStatus?: string };
  }
}

export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token de acceso requerido', 'TOKEN_REQUIRED');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const users = await query<UserRow[]>(
      'SELECT id, role, status FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (users.length === 0) {
      throw new AppError(401, 'Usuario no encontrado', 'USER_NOT_FOUND');
    }

    const user = users[0];
    if (user.status === 'suspended') {
      throw new AppError(403, 'Cuenta suspendida', 'ACCOUNT_SUSPENDED');
    }
    if (user.status === 'deleted') {
      throw new AppError(401, 'Cuenta eliminada', 'ACCOUNT_DELETED');
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      userStatus: user.status,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, 'Token inválido o expirado', 'INVALID_TOKEN'));
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch {
    next();
  }
};
