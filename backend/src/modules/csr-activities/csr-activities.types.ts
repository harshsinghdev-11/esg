import { z } from 'zod';

export const createCsrActivitySchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid UUID format'),
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    activityDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    pointsValue: z.number().int().min(0, 'Points value must be a positive integer').optional(),
    evidenceRequired: z.boolean().optional(),
  }),
});

export const updateCsrActivitySchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid UUID format').optional(),
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    activityDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    pointsValue: z.number().int().min(0).optional(),
    evidenceRequired: z.boolean().optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']).optional(),
  }),
});
