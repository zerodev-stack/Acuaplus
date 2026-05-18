import { z } from 'zod';

export const createReviewSchema = z.object({
  product_id: z.number().int().positive(),
  order_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
