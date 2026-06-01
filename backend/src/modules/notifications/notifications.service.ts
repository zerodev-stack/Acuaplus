import { query } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { NotificationRow } from '../../types';

export const getUserNotifications = async (userId: number, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const countResult = await query<{ total: number }[]>(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())',
    [userId]
  );

  const notifications = await query<NotificationRow[]>(
    `SELECT * FROM notifications
     WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  const unreadCount = await query<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );

  return {
    data: notifications,
    unreadCount: unreadCount[0].count,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit) || 1,
  };
};

export const markAsRead = async (notificationId: number, userId: number) => {
  const result = await query<{ affectedRows: number }[]>(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );

  if ((result as any).affectedRows === 0) {
    throw new AppError(404, 'Notificación no encontrada', 'NOTIFICATION_NOT_FOUND');
  }

  return { message: 'Notificación marcada como leída' };
};
