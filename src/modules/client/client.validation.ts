import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Gender is required' }),
});

export const updateClientSchema = createClientSchema.partial();

export const clientParamsSchema = z.object({
  id: z.string().uuid('Invalid client ID'),
});