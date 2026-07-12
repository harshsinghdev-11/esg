import { z } from 'zod';

export const createCarbonTransactionSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid('Invalid UUID format'),
    sourceType: z.enum(['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'MANUAL']),
    emissionFactorId: z.string().uuid('Invalid UUID format'),
    quantity: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'Quantity must be a number' }),
    transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
  }),
});

export const updateCarbonTransactionSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid('Invalid UUID format').optional(),
    sourceType: z.enum(['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET', 'MANUAL']).optional(),
    emissionFactorId: z.string().uuid('Invalid UUID format').optional(),
    quantity: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'Quantity must be a number' }).optional(),
    transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
  }),
});
