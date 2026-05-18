import { query, transaction, getConnection } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { CartRow, CartItemRow, ProductRow } from '../../types';
import { ResultSetHeader } from 'mysql2';

export const getCart = async (userId: number) => {
  let carts = await query<CartRow[]>(
    'SELECT * FROM cart WHERE user_id = ?',
    [userId]
  );

  if (carts.length === 0) {
    const conn = await getConnection();
    try {
      const [result] = await conn.execute<ResultSetHeader>(
        'INSERT INTO cart (user_id) VALUES (?)',
        [userId]
      );
      return { id: result.insertId, user_id: userId, items: [] };
    } finally {
      conn.release();
    }
  }

  const cart = carts[0];
  const items = await query<(CartItemRow & { name: string; price: number; stock: number; image_url: string | null })[]>(
    `SELECT ci.*, p.name, p.price, p.stock, pi.image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
     WHERE ci.cart_id = ?
     ORDER BY ci.added_at DESC`,
    [cart.id]
  );

  return { ...cart, items };
};

export const addItem = async (userId: number, productId: number, quantity: number) => {
  const products = await query<ProductRow[]>(
    'SELECT * FROM products WHERE id = ? AND status = ? AND deleted_at IS NULL',
    [productId, 'active']
  );
  if (products.length === 0) throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
  if (products[0].stock < quantity) throw new AppError(400, 'Stock insuficiente', 'INSUFFICIENT_STOCK');

  return transaction(async (conn) => {
    let carts = await conn.execute<import('mysql2').RowDataPacket[]>(
      'SELECT * FROM cart WHERE user_id = ?',
      [userId]
    );
    let cartId: number;
    if ((carts[0] as any[]).length === 0) {
      const [result] = await conn.execute<import('mysql2').ResultSetHeader>(
        'INSERT INTO cart (user_id) VALUES (?)',
        [userId]
      );
      cartId = result.insertId;
    } else {
      cartId = (carts[0] as any[])[0].id;
    }

    const existing = await conn.execute<import('mysql2').RowDataPacket[]>(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if ((existing[0] as any[]).length > 0) {
      const current = (existing[0] as any[])[0];
      const newQty = current.quantity + quantity;
      if (newQty > products[0].stock) throw new AppError(400, 'Stock insuficiente', 'INSUFFICIENT_STOCK');
      await conn.execute(
        'UPDATE cart_items SET quantity = ?, unit_price_snapshot = ? WHERE id = ?',
        [newQty, products[0].price, current.id]
      );
    } else {
      await conn.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity, unit_price_snapshot) VALUES (?, ?, ?, ?)',
        [cartId, productId, quantity, products[0].price]
      );
    }

    logger.info('Cart', 'Item agregado', { userId, productId, quantity });
    return getCart(userId);
  });
};

export const updateItem = async (userId: number, itemId: number, quantity: number) => {
  const items = await query<(CartItemRow & { cart_id: number })[]>(
    `SELECT ci.* FROM cart_items ci
     JOIN cart c ON c.id = ci.cart_id
     WHERE ci.id = ? AND c.user_id = ?`,
    [itemId, userId]
  );
  if (items.length === 0) throw new AppError(404, 'Item no encontrado', 'ITEM_NOT_FOUND');

  if (quantity === 0) {
    await query('DELETE FROM cart_items WHERE id = ?', [itemId]);
  } else {
    const products = await query<ProductRow[]>(
      'SELECT stock FROM products WHERE id = ?',
      [items[0].product_id]
    );
    if (products.length > 0 && quantity > products[0].stock) {
      throw new AppError(400, 'Stock insuficiente', 'INSUFFICIENT_STOCK');
    }
    await query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, itemId]);
  }

  return getCart(userId);
};

export const removeItem = async (userId: number, itemId: number) => {
  const items = await query<(CartItemRow & { cart_id: number })[]>(
    `SELECT ci.id FROM cart_items ci
     JOIN cart c ON c.id = ci.cart_id
     WHERE ci.id = ? AND c.user_id = ?`,
    [itemId, userId]
  );
  if (items.length === 0) throw new AppError(404, 'Item no encontrado', 'ITEM_NOT_FOUND');

  await query('DELETE FROM cart_items WHERE id = ?', [itemId]);
  logger.info('Cart', 'Item eliminado', { userId, itemId });
  return getCart(userId);
};
