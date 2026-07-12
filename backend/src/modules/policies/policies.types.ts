import { z } from 'zod';

export const createPolicySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    version: z.string().optional(),
    documentUrl: z.string().url('Invalid URL').optional().nullable(),
    effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
  }),
});

export const updatePolicySchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    version: z.string().optional(),
    documentUrl: z.string().url().optional().nullable(),
    effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});
