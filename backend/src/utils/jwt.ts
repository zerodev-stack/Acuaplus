import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface JwtPayload {
  userId: number;
  role: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

export const calculateRefreshExpiry = (): Date => {
  const match = env.REFRESH_TOKEN_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1], 10);
  const unit = match[2] as 'd' | 'h' | 'm' | 's';
  const multipliers: Record<string, number> = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return new Date(Date.now() + value * (multipliers[unit] || 86400000));
};
