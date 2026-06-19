import {z} from 'zod';

export const createAddressSchema = z.object({
    recipient_name: z.string().min(2).max(100),
    address_line: z.string().min(6).max(255),
    city: z.string().min(2).max(100),
    department: z.string().min(2).max(100),
    zip_code: z.string().max(50).optional(),
    is_default: z.boolean().default(false),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;