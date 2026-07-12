import { z } from 'zod';

export const createOperationalRecordSchema = z.object({
  body: z.object({
    sourceType: z.enum(['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET']),
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    description: z.string().optional().nullable(),
    quantity: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'Quantity must be a number' }),
    unit: z.string().min(1, 'Unit is required'),
    emissionFactorId: z.string().uuid('Invalid UUID format').optional().nullable(),
    recordDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    amount: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'Amount must be a number' }).optional().nullable(),
  }),
});

export const updateOperationalRecordSchema = z.object({
  body: z.object({
    sourceType: z.enum(['PURCHASE', 'MANUFACTURING', 'EXPENSE', 'FLEET']).optional(),
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    description: z.string().optional().nullable(),
    quantity: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'Quantity must be a number' }).optional(),
    unit: z.string().min(1).optional(),
    emissionFactorId: z.string().uuid('Invalid UUID format').optional().nullable(),
    recordDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    amount: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'Amount must be a number' }).optional().nullable(),
  }),
});
