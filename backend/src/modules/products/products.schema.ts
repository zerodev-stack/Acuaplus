import { z } from 'zod';

export const createProductSchema = z.object({
  category_id: z.number().int().positive(),
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  sku: z.string().max(60).optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  min_order_qty: z.number().int().min(1).default(1),
  unit: z.string().max(30).optional(),
  weight_kg: z.number().positive().optional(),
  status: z.enum(['draft', 'active']).default('draft'),
  specs: z.array(z.object({
    spec_key: z.string().max(80),
    spec_value: z.string().max(200),
    spec_type: z.enum(['text', 'number', 'range']).default('text'),
  })).optional(),
  images: z.array(z.object({
    image_url: z.string().url().optional(),
    alt_text: z.string().max(150).optional(),
    source: z.enum(['url']),
    is_primary: z.boolean().default(false),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
