import { z } from 'zod';

export const saveCardSchema = z.object({
  pan: z.string().min(13).max(19),
  cvv: z.string().min(3).max(4),
  cardholder_name: z.string().min(2).max(120),
  exp_month: z.number().int().min(1).max(12),
  exp_year: z.number().int().min(2024).max(2040),
  is_default: z.boolean().default(false),
});

export const processPaymentSchema = z.object({
  order_id: z.number().int().positive(),
  card_id: z.number().int().positive(),
});

export type SaveCardInput = z.infer<typeof saveCardSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
