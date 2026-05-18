import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import * as authService from './auth.service';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';

const REFRESH_COOKIE = 'refresh_token';

/**
 * Configura la cookie HTTP Only para almacenar el Refresh Token.
 * Se usa HTTP Only por seguridad para prevenir ataques XSS.
 * @param res Objeto de respuesta de Express
 * @param token El refresh token generado
 */
const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

/**
 * Registra un nuevo usuario en el sistema.
 * Limpia los campos vacíos, valida con Zod y delega la creación al authService.
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cleanBody: Record<string, unknown> = {};
    // Limpieza de campos nulos o vacíos
    for (const [k, v] of Object.entries(req.body)) {
      if (v !== '' && v !== null && v !== undefined) cleanBody[k] = v;
    }
    const input = registerSchema.parse(cleanBody);
    const result = await authService.registerUser(input);
    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

/**
 * Inicia sesión en el sistema.
 * Valida las credenciales, devuelve un Access Token y configura el Refresh Token en la cookie.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input);
    
    // El refresh token se guarda seguro en una cookie para evitar robos desde Javascript
    setRefreshCookie(res, result.refreshToken);
    
    res.json({
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if ((error as any)?.name === 'ZodError') {
      return next(new AppError(400, 'Datos inválidos', 'VALIDATION_ERROR', (error as any).errors));
    }
    next(error);
  }
};

/**
 * Renueva el Access Token utilizando un Refresh Token válido almacenado en las cookies.
 */
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new AppError(401, 'Refresh token no encontrado', 'REFRESH_TOKEN_MISSING');
    }
    const result = await authService.refreshUserToken(token);
    setRefreshCookie(res, result.refreshToken);
    res.json({ data: { accessToken: result.accessToken } });
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(error);
  }
};

/**
 * Cierra la sesión del usuario.
 * Elimina la cookie del Refresh Token y marca el token como inválido en la BD.
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await authService.logoutUser(token);
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.json({ data: { message: 'Sesión cerrada exitosamente' } });
  } catch (error) {
    next(error);
  }
};
