import { z } from 'zod';

export const createEnvironmentalGoalSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    title: z.string().min(1, 'Title is required'),
    metric: z.string().min(1, 'Metric is required'),
    targetValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'targetValue must be a number' }),
    currentValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'currentValue must be a number' }).optional(),
    unit: z.string().min(1, 'Unit is required'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
  }),
});

export const updateEnvironmentalGoalSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    title: z.string().min(1).optional(),
    metric: z.string().min(1).optional(),
    targetValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'targetValue must be a number' }).optional(),
    currentValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'currentValue must be a number' }).optional(),
    unit: z.string().min(1).optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'MISSED']).optional(),
  }),
});
