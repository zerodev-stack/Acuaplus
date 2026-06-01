import { query, transaction } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { getPaginationParams, paginate } from '../../utils/pagination';
import { OrderRow, SellerOrderRow } from '../../types';
import { ResultSetHeader } from 'mysql2';

export const createOrder = async (buyerId: number, input: {
  address_id: number;
  payment_method: string;
  card_id?: number;
  notes?: string;
}) => {
  return transaction(async (conn) => {
    const [carts] = await conn.execute<any[]>(
      'SELECT * FROM cart WHERE user_id = ?',
      [buyerId]
    );
    if (carts.length === 0) throw new AppError(404, 'Carrito no encontrado', 'CART_NOT_FOUND');
    const cart = carts[0];

    const [cartItems] = await conn.execute<any[]>(
      `SELECT ci.*, p.price, p.seller_id, p.stock, p.stock_version, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ? AND p.deleted_at IS NULL AND p.status = 'active'`,
      [cart.id]
    );

    if (cartItems.length === 0) {
      throw new AppError(400, 'El carrito está vacío', 'EMPTY_CART');
    }

    const [addresses] = await conn.execute<any[]>(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [input.address_id, buyerId]
    );
    if (addresses.length === 0) throw new AppError(404, 'Dirección no encontrada', 'ADDRESS_NOT_FOUND');
    const address = addresses[0];
    const shipping_address = `${address.address_line}, ${address.city}${address.department ? ', ' + address.department : ''}${address.zip_code ? ' - ' + address.zip_code : ''}`;

    const sellerGroups = new Map<number, any[]>();
    for (const item of cartItems) {
      const sellerId = item.seller_id;
      if (!sellerGroups.has(sellerId)) sellerGroups.set(sellerId, []);
      sellerGroups.get(sellerId)!.push(item);
    }

    let subtotalAmount = 0;
    const orderItems: any[] = [];

    for (const [sellerId, items] of sellerGroups) {
      let sellerSubtotal = 0;
      for (const item of items) {
        const [productRows] = await conn.execute<any[]>(
          'SELECT stock, stock_version, price, name FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );
        if (productRows.length === 0) throw new AppError(404, `Producto "${item.name}" no encontrado`, 'PRODUCT_NOT_FOUND');
        const product = productRows[0];
        if (product.stock < item.quantity) {
          throw new AppError(400, `Stock insuficiente para "${product.name}"`, 'INSUFFICIENT_STOCK');
        }
        const itemSubtotal = product.price * item.quantity;
        sellerSubtotal += itemSubtotal;
        subtotalAmount += itemSubtotal;
        orderItems.push({ ...item, price: product.price, subtotal: itemSubtotal, sellerId: product.seller_id || item.seller_id });
      }
    }

    const totalAmount = subtotalAmount;

    const [orderResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders (buyer_id, address_id, shipping_address, payment_method, subtotal_amount, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [buyerId, input.address_id, shipping_address, input.payment_method, subtotalAmount, totalAmount, input.notes || null]
    );
    const orderId = orderResult.insertId;

    for (const [sellerId, items] of sellerGroups) {
      let sellerSubtotal = 0;
      const itemDetails: any[] = [];
      for (const item of items) {
        const itemTotal = item.price * item.quantity;
        sellerSubtotal += itemTotal;
        itemDetails.push(item);
      }

      const [sellerOrderResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO seller_orders (order_id, seller_id, subtotal) VALUES (?, ?, ?)`,
        [orderId, sellerId, sellerSubtotal]
      );
      const sellerOrderId = sellerOrderResult.insertId;

      for (const item of itemDetails) {
        await conn.execute(
          `INSERT INTO order_items (order_id, seller_order_id, product_id, seller_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, sellerOrderId, item.product_id, sellerId, item.quantity, item.price, item.price * item.quantity]
        );

        await conn.execute(
          `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.product_id, item.quantity]
        );
      }

      await conn.execute(
        `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type)
         VALUES ((SELECT user_id FROM seller_profiles WHERE id = ?), 'new_sale', 'Nueva venta recibida', 'Se ha realizado una nueva compra de tus productos.', ?, 'seller_orders')`,
        [sellerId, sellerOrderId]
      );
    }

    await conn.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    await conn.execute(
      `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, 'order_update', 'Orden creada', 'Tu orden ha sido creada exitosamente.', ?, 'orders')`,
      [buyerId, orderId]
    );

    logger.info('Orders', 'Orden creada', { orderId, buyerId, totalAmount });
    return getOrderById(orderId, buyerId);
  });
};

export const getMyOrders = async (userId: number, queryParams: { page?: string; limit?: string }) => {
  const { page, limit, offset } = getPaginationParams(queryParams);

  const countResult = await query<{ total: number }[]>(
    'SELECT COUNT(*) as total FROM orders WHERE buyer_id = ?',
    [userId]
  );
  const total = countResult[0].total;

  const orders = await query<OrderRow[]>(
    // ✅ LIMIT y OFFSET interpolados como literales numéricos
    `SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
    [userId]
  );

  const enriched = await enrichOrders(orders);
  return paginate(enriched ?? [], total, page, limit);
};

export const getOrderById = async (orderId: number, userId?: number) => {
  const orders = await query<OrderRow[]>(
    `SELECT * FROM orders WHERE id = ?`,
    [orderId]
  );
  if (orders.length === 0) throw new AppError(404, 'Orden no encontrada', 'ORDER_NOT_FOUND');
  
  const order = orders[0];

  if (userId && order.buyer_id !== userId) {
    const sellerCheck = await query<{id: number}[]>(
      `SELECT so.id FROM seller_orders so
       JOIN seller_profiles sp ON sp.user_id = so.seller_id
       WHERE so.order_id = ? AND sp.user_id = ?`,
      [orderId, userId]
    );
    if (sellerCheck.length === 0)
      throw new AppError(403, 'No tienes acceso a esta orden', 'FORBIDDEN');
  }

  // ✅ Pasar SIEMPRE como array
  const enriched = await enrichOrders([order]);
  return enriched[0]; // ← devolver solo el primero
};

export const updateSellerOrderStatus = async (sellerOrderId: number, userId: number, input: { status: string; tracking_code?: string }) => {
  const sellerOrders = await query<(SellerOrderRow & { sp_user_id: number })[]>(
    `SELECT so.*, sp.user_id as sp_user_id FROM seller_orders so
     JOIN seller_profiles sp ON sp.user_id = so.seller_id
     WHERE so.id = ?`,
    [sellerOrderId]
  );

  if (sellerOrders.length === 0) throw new AppError(404, 'Seller order no encontrada', 'SELLER_ORDER_NOT_FOUND');
  if (sellerOrders[0].sp_user_id !== userId) throw new AppError(403, 'No eres el vendedor de esta orden', 'FORBIDDEN');

  const so = sellerOrders[0];
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
  };
  const allowed = validTransitions[so.status] || [];
  if (!allowed.includes(input.status)) {
    throw new AppError(400, `Transición inválida de "${so.status}" a "${input.status}"`, 'INVALID_TRANSITION');
  }

  if (input.tracking_code) {
    await query('UPDATE seller_orders SET status = ?, tracking_code = ? WHERE id = ?',
      [input.status, input.tracking_code, sellerOrderId]);
  } else {
    await query('UPDATE seller_orders SET status = ? WHERE id = ?',
      [input.status, sellerOrderId]);
  }

  await query(
    `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, 'order_update', 'Estado de orden actualizado', 'Tu orden ha sido actualizada a: ${input.status}', ?, 'orders')`,
    [so.order_id, so.order_id]
  );

  if (input.status === 'shipped') {
    await query(
      'INSERT INTO order_shipments (seller_order_id, status) VALUES (?, ?)',
      [sellerOrderId, 'handed_to_carrier']
    );
  }

  logger.info('Orders', 'Seller order actualizada', { sellerOrderId, status: input.status });
  return getOrderById(so.order_id);
};

export const getSellerOrders = async (userId: number, queryParams: { page?: string; limit?: string; status?: string }) => {
  const { page, limit, offset } = getPaginationParams(queryParams);
  const conditions = ['sp.user_id = ?'];
  const params: unknown[] = [userId];

  if (queryParams.status) {
    conditions.push('so.status = ?');
    params.push(queryParams.status);
  }

  const where = conditions.join(' AND ');

  const countResult = await query<{ total: number }[]>(
    `SELECT COUNT(*) as total FROM seller_orders so
     JOIN seller_profiles sp ON sp.id = so.seller_id
     WHERE ${where}`,
    params
  );

  const sellerOrders = await query<SellerOrderRow[]>(
  `SELECT so.* FROM seller_orders so
   JOIN seller_profiles sp ON sp.user_id = so.seller_id
   WHERE ${where}
   ORDER BY so.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
  // ✅ Sin limit/offset en el array
  params
);

  return paginate(sellerOrders, countResult[0].total, page, limit);
};

const enrichOrders = async (orders: OrderRow[]) => {
  if (orders.length === 0) return []; // ← siempre retornar array
  
  const orderIds = orders.map(o => o.id);
  const sellerOrders = await query<any[]>(
    `SELECT so.*, sp.business_name, sp.user_id AS seller_user_id
     FROM seller_orders so
     JOIN seller_profiles sp ON sp.user_id = so.seller_id
     WHERE so.order_id IN (${orderIds.map(() => '?').join(',')})`,
    orderIds
  );

  return orders.map(order => ({
    ...order,
    seller_orders: sellerOrders.filter((so: any) => so.order_id === order.id),
  }));
};
