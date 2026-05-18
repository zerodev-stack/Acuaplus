import { query } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { UserRow, SellerProfileRow } from '../../types';
import { logger } from '../../utils/logger';

const userFields = `
  u.id, u.name, u.email, u.role, u.status, u.phone,
  u.avatar_url, u.created_at, u.updated_at
`;

export const getUserById = async (userId: number) => {
  const users = await query<(UserRow & { business_name?: string })[]>(
    `SELECT ${userFields}, sp.business_name
     FROM users u
     LEFT JOIN seller_profiles sp ON sp.user_id = u.id
     WHERE u.id = ? AND u.deleted_at IS NULL`,
    [userId]
  );

  if (users.length === 0) {
    throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
  }

  const { password_hash, deleted_at, email_verified_at, ...safeUser } = users[0];
  return safeUser;
};

export const updateUser = async (userId: number, updates: Record<string, unknown>) => {
  const allowed = ['name', 'phone', 'avatar_url'];
  const sets: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowed.includes(key)) {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (sets.length === 0) {
    throw new AppError(400, 'No hay campos válidos', 'NO_FIELDS');
  }

  await query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    [...values, userId]
  );

  logger.info('Users', 'Perfil actualizado', { userId });
  return getUserById(userId);
};

export const getPendingSellers = async () => {
  const sellers = await query<(UserRow & SellerProfileRow)[]>(
    `SELECT ${userFields}, sp.id as profile_id, sp.business_name, sp.nit,
            sp.description, sp.location, sp.created_at as requested_at
     FROM users u
     JOIN seller_profiles sp ON sp.user_id = u.id
     WHERE u.role = 'seller' AND u.status = 'pending'
     ORDER BY u.created_at DESC`
  );

  return sellers.map((s) => {
    const { password_hash, deleted_at, email_verified_at, ...safe } = s;
    return safe;
  });
};

export const approveSeller = async (userId: number, adminId: number) => {
  const users = await query<UserRow[]>(
    'SELECT id, status, role FROM users WHERE id = ? AND deleted_at IS NULL',
    [userId]
  );

  if (users.length === 0) throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
  const user = users[0];
  if (user.role !== 'seller') throw new AppError(400, 'El usuario no es vendedor', 'NOT_SELLER');
  if (user.status !== 'pending') throw new AppError(400, 'El vendedor no está pendiente', 'NOT_PENDING');

  await query(
    "UPDATE users SET status = 'active' WHERE id = ?",
    [userId]
  );

  await query(
    'UPDATE seller_profiles SET approved_by = ?, approved_at = NOW() WHERE user_id = ?',
    [adminId, userId]
  );

  await query(
    "INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, 'seller_approved', 'Cuenta aprobada', 'Tu cuenta de vendedor ha sido aprobada. Ya puedes publicar productos.', ?, 'products')",
    [userId, userId]
  );

  logger.info('Users', 'Vendedor aprobado', { userId, adminId });
  return { message: 'Vendedor aprobado exitosamente' };
};

export const suspendUser = async (userId: number) => {
  const users = await query<UserRow[]>(
    'SELECT id, status, role FROM users WHERE id = ? AND deleted_at IS NULL',
    [userId]
  );

  if (users.length === 0) throw new AppError(404, 'Usuario no encontrado', 'USER_NOT_FOUND');
  if (users[0].role === 'admin') throw new AppError(403, 'No se puede suspender un admin', 'CANNOT_SUSPEND_ADMIN');

  await query(
    "UPDATE users SET status = 'suspended' WHERE id = ?",
    [userId]
  );

  logger.info('Users', 'Usuario suspendido', { userId });
  return { message: 'Usuario suspendido exitosamente' };
};
