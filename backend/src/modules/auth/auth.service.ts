import bcrypt from 'bcryptjs';
import { query, transaction } from '../../config/db';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  calculateRefreshExpiry,
} from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { UserRow, SellerProfileRow } from '../../types';
import { RegisterInput, LoginInput } from './auth.schema';

export const registerUser = async (input: RegisterInput) => {
  const existing = await query<UserRow[]>(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
    [input.email]
  );
  if (existing.length > 0) {
    throw new AppError(409, 'El email ya está registrado', 'EMAIL_EXISTS');
  }

  const password_hash = await bcrypt.hash(input.password, 12);
  const userStatus = input.role === 'seller' ? 'pending' : 'active';

  return transaction(async (conn) => {
    const [result] = await conn.execute<import('mysql2').ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, role, status, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [input.name, input.email, password_hash, input.role, userStatus, input.phone || null]
    );

    if (input.role === 'seller') {
      await conn.execute<import('mysql2').ResultSetHeader>(
        'INSERT INTO seller_profiles (user_id, business_name, nit) VALUES (?, ?, ?)',
        [result.insertId, input.business_name || input.name, input.nit || null]
      );

      await conn.execute<import('mysql2').ResultSetHeader>(
        'INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, 'system', 'Registro completado', 'Tu cuenta de vendedor está pendiente de aprobación.', result.insertId, 'products']
      );
    }

    await conn.execute<import('mysql2').ResultSetHeader>(
      'INSERT INTO cart (user_id) VALUES (?)',
      [result.insertId]
    );

    logger.info('Auth', 'Usuario registrado', { userId: result.insertId, role: input.role });
    return { userId: result.insertId, role: input.role, status: userStatus };
  });
};

export const loginUser = async (input: LoginInput) => {
  const users = await query<UserRow[]>(
    'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
    [input.email]
  );

  if (users.length === 0) {
    throw new AppError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  const user = users[0];

  if (user.status === 'suspended') {
    throw new AppError(403, 'Cuenta suspendida', 'ACCOUNT_SUSPENDED');
  }
  if (user.status === 'pending') {
    throw new AppError(403, 'Tu cuenta está pendiente de aprobación', 'PENDING_APPROVAL');
  }

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) {
    throw new AppError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, tokenHash, calculateRefreshExpiry()]
  );

  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = ?',
    [user.id]
  );

  logger.info('Auth', 'Usuario autenticado', { userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshUserToken = async (token: string) => {
  const tokenHash = hashToken(token);
  const tokens = await query<(RefreshTokenRow & { user_role: string; user_status: string })[]>(
    `SELECT rt.*, u.role AS user_role, u.status AS user_status
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = ? AND rt.is_revoked = 0 AND rt.expires_at > NOW()`,
    [tokenHash]
  );

  if (tokens.length === 0) {
    throw new AppError(401, 'Refresh token inválido o expirado', 'INVALID_REFRESH_TOKEN');
  }

  const tokenRow = tokens[0];

  if (tokenRow.user_status === 'suspended') {
    throw new AppError(403, 'Cuenta suspendida', 'ACCOUNT_SUSPENDED');
  }

  await query(
    'UPDATE refresh_tokens SET is_revoked = 1 WHERE id = ?',
    [tokenRow.id]
  );

  const newAccessToken = signAccessToken({ userId: tokenRow.user_id, role: tokenRow.user_role });
  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [tokenRow.user_id, newTokenHash, calculateRefreshExpiry()]
  );

  logger.info('Auth', 'Token refrescado', { userId: tokenRow.user_id });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (token: string) => {
  const tokenHash = hashToken(token);
  await query(
    'UPDATE refresh_tokens SET is_revoked = 1 WHERE token_hash = ?',
    [tokenHash]
  );
};

interface RefreshTokenRow {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  is_revoked: number;
}
