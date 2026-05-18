import crypto from 'crypto';
import { ResultSetHeader } from 'mysql2';
import { query, transaction } from '../../config/db';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';
import { SavedCardRow, OrderRow } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const saveCard = async (userId: number, input: {
  pan: string;
  cvv: string;
  cardholder_name: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}) => {
  const last_four = input.pan.slice(-4);
  const brand = detectBrand(input.pan);

  const sim_token = crypto.randomBytes(16).toString('hex');
  const pan_encrypted = crypto.createHash('sha256').update(input.pan).digest('hex');
  const cvv_hash = crypto.createHash('sha256').update(input.cvv).digest('hex');

  return transaction(async (conn) => {
    if (input.is_default) {
      await conn.execute(
        'UPDATE saved_cards SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO saved_cards (user_id, sim_token, last_four, brand, cardholder_name, exp_month, exp_year, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, sim_token, last_four, brand, input.cardholder_name, input.exp_month, input.exp_year, input.is_default ? 1 : 0]
    );

    await conn.execute<ResultSetHeader>(
      'INSERT INTO card_sim_vault (saved_card_id, pan_encrypted, cvv_hash) VALUES (?, ?, ?)',
      [result.insertId, pan_encrypted, cvv_hash]
    );

    logger.info('Payments', 'Tarjeta guardada', { userId, lastFour: last_four, brand });
    return {
      id: result.insertId,
      sim_token,
      last_four,
      brand,
      cardholder_name: input.cardholder_name,
      exp_month: input.exp_month,
      exp_year: input.exp_year,
      is_default: input.is_default ? 1 : 0,
    };
  });
};

export const getMyCards = async (userId: number) => {
  const cards = await query<SavedCardRow[]>(
    "SELECT id, sim_token, last_four, brand, cardholder_name, exp_month, exp_year, is_default, created_at FROM saved_cards WHERE user_id = ? AND is_active = 1 ORDER BY is_default DESC, created_at DESC",
    [userId]
  );
  return cards;
};

export const processPayment = async (userId: number, input: { order_id: number; card_id: number }) => {
  const orders = await query<OrderRow[]>(
    'SELECT * FROM orders WHERE id = ? AND buyer_id = ?',
    [input.order_id, userId]
  );
  if (orders.length === 0) throw new AppError(404, 'Orden no encontrada', 'ORDER_NOT_FOUND');
  const order = orders[0];
  if (order.payment_status !== 'unpaid') throw new AppError(400, 'La orden ya fue pagada', 'ALREADY_PAID');

  const cards = await query<SavedCardRow[]>(
    'SELECT * FROM saved_cards WHERE id = ? AND user_id = ? AND is_active = 1',
    [input.card_id, userId]
  );
  if (cards.length === 0) throw new AppError(404, 'Tarjeta no encontrada', 'CARD_NOT_FOUND');
  const card = cards[0];

  const rules = await query<SimRuleRow[]>(
    'SELECT * FROM sim_payment_rules WHERE last_four = ?',
    [card.last_four]
  );

  const rule = rules.length > 0 ? rules[0] : null;
  const delay = rule?.delay_ms || 800;

  await new Promise(resolve => setTimeout(resolve, delay));

  let paymentStatus: string;
  let gatewayResponse: Record<string, unknown>;

  if (rule && rule.behavior !== 'approved') {
    paymentStatus = rule.behavior;
    gatewayResponse = {
      error: true,
      decline_code: rule.decline_code,
      message: rule.decline_message,
      simulated_at: new Date().toISOString(),
    };
  } else {
    paymentStatus = 'approved';
    gatewayResponse = {
      success: true,
      transaction_id: uuidv4(),
      message: 'Pago simulado aprobado',
      simulated_at: new Date().toISOString(),
    };
  }

  return transaction(async (conn) => {
    const gatewayTxId = uuidv4();

    await conn.execute(
      `INSERT INTO payment_transactions (order_id, card_id, gateway, gateway_tx_id, amount, currency, status, is_simulation, gateway_response)
       VALUES (?, ?, 'simulation', ?, ?, 'COP', ?, 1, ?)`,
      [input.order_id, input.card_id, gatewayTxId, order.total_amount, paymentStatus, JSON.stringify(gatewayResponse)]
    );

    if (paymentStatus === 'approved') {
      await conn.execute(
        "UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
        [input.order_id]
      );

      await conn.execute(
        `UPDATE seller_orders SET status = 'confirmed' WHERE order_id = ?`,
        [input.order_id]
      );

      const orderUsers = await conn.execute<any[]>(
        'SELECT buyer_id FROM orders WHERE id = ?',
        [input.order_id]
      );

      await conn.execute(
        `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, 'payment_approved', 'Pago aprobado', 'El pago de tu orden #${input.order_id} ha sido aprobado.', ?, 'payment_transactions')`,
        [userId, input.order_id]
      );
    } else {
      await conn.execute(
        "UPDATE orders SET payment_status = 'failed' WHERE id = ?",
        [input.order_id]
      );

      await conn.execute(
        `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type) VALUES (?, 'payment_failed', 'Pago rechazado', 'El pago de tu orden #${input.order_id} fue rechazado. Motivo: ${rule?.decline_message || 'Desconocido'}', ?, 'payment_transactions')`,
        [userId, input.order_id]
      );
    }

    logger.info('Payments', 'Pago procesado', {
      orderId: input.order_id,
      status: paymentStatus,
      lastFour: card.last_four,
    });

    return {
      transaction_id: gatewayTxId,
      status: paymentStatus,
      gateway_response: gatewayResponse,
    };
  });
};

const detectBrand = (pan: string): SavedCardRow['brand'] => {
  if (pan.startsWith('4')) return 'visa';
  if (pan.startsWith('5')) return 'mastercard';
  if (pan.startsWith('3')) return 'amex';
  if (pan.startsWith('6')) return 'diners';
  return 'other';
};

interface SimRuleRow {
  id: number;
  last_four: string;
  behavior: 'approved' | 'declined' | 'timeout' | 'insufficient_funds';
  decline_code: string | null;
  decline_message: string | null;
  delay_ms: number;
}
