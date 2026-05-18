import { z } from 'zod';

export const createOrderSchema = z.object({
  address_id: z.number().int().positive(),
  payment_method: z.enum(['card', 'transfer', 'cash_on_delivery']).default('card'),
  card_id: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const updateSellerOrderSchema = z.object({
  status: z.enum(['confirmed', 'shipped', 'delivered', 'cancelled']),
  tracking_code: z.string().max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateSellerOrderInput = z.infer<typeof updateSellerOrderSchema>;
