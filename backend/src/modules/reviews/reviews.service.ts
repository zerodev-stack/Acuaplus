import { query, transaction } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { ReviewRow } from '../../types';

export const createReview = async (buyerId: number, input: {
  product_id: number;
  order_id: number;
  rating: number;
  comment?: string;
}) => {
  const orders = await query<{ id: number; status: string }[]>(
    "SELECT id, status FROM orders WHERE id = ? AND buyer_id = ? AND status = 'delivered'",
    [input.order_id, buyerId]
  );
  if (orders.length === 0) {
    throw new AppError(400, 'Solo puedes calificar productos de órdenes entregadas', 'ORDER_NOT_DELIVERED');
  }

  const items = await query<{ id: number }[]>(
    'SELECT id FROM order_items WHERE order_id = ? AND product_id = ?',
    [input.order_id, input.product_id]
  );
  if (items.length === 0) {
    throw new AppError(400, 'No compraste este producto en esta orden', 'PRODUCT_NOT_IN_ORDER');
  }

  const existing = await query<{ id: number }[]>(
    'SELECT id FROM reviews WHERE product_id = ? AND buyer_id = ? AND order_id = ?',
    [input.product_id, buyerId, input.order_id]
  );
  if (existing.length > 0) {
    throw new AppError(409, 'Ya calificaste este producto en esta orden', 'ALREADY_REVIEWED');
  }

  return transaction(async (conn) => {
    const [result] = await conn.execute<import('mysql2').ResultSetHeader>(
      'INSERT INTO reviews (product_id, buyer_id, order_id, rating, comment, is_verified) VALUES (?, ?, ?, ?, ?, 1)',
      [input.product_id, buyerId, input.order_id, input.rating, input.comment || null]
    );

    await conn.execute(
      `UPDATE products SET
        rating_avg = (
          SELECT ROUND(AVG(rating), 2) FROM reviews WHERE product_id = ?
        ),
        rating_count = (
          SELECT COUNT(*) FROM reviews WHERE product_id = ?
        )
      WHERE id = ?`,
      [input.product_id, input.product_id, input.product_id]
    );

    const [productRows] = await conn.execute<any[]>(
      'SELECT p.seller_id, sp.user_id FROM products p JOIN seller_profiles sp ON sp.id = p.seller_id WHERE p.id = ?',
      [input.product_id]
    );

    if (productRows.length > 0) {
      const sellerUserId = productRows[0].user_id;
      await conn.execute(
        `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, 'review', 'Nueva calificación', 'Un producto tuyo ha recibido una calificación de ${input.rating} estrellas.', ?, 'reviews')`,
        [sellerUserId, result.insertId]
      );
    }

    logger.info('Reviews', 'Review creada', { productId: input.product_id, buyerId, rating: input.rating });
    return { id: result.insertId, ...input, is_verified: 1 };
  });
};

export const getProductReviews = async (productId: number, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const countResult = await query<{ total: number }[]>(
    'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
    [productId]
  );

  const reviews = await query<(ReviewRow & { buyer_name: string })[]>(
    `SELECT r.*, u.name as buyer_name
     FROM reviews r
     JOIN users u ON u.id = r.buyer_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC
     LIMIT ? OFFSET ?`,
    [productId, limit, offset]
  );

  return {
    data: reviews,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit) || 1,
  };
};
