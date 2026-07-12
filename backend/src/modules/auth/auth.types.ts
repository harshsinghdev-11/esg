import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    organizationName: z.string().min(1, 'Organization name is required'),
    adminName: z.string().min(1, 'Admin name is required'),
    adminEmail: z.string().email('Invalid email format'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});
