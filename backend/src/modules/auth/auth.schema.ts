import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(150),
  password: z.string().min(6).max(100),
  role: z.enum(['buyer', 'seller']).default('buyer'),
  phone: z.string().max(20).optional(),
  business_name: z.string().min(2).max(150).optional(),
  nit: z.string().max(30).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
