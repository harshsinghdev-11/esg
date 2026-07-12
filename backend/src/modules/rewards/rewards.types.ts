import { z } from 'zod';

export const createRewardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    pointsRequired: z.number().int().min(0, 'Points required must be a positive integer'),
    stock: z.number().int().min(0).optional(),
  }),
});

export const updateRewardSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    pointsRequired: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});

export const updateRedemptionSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'FULFILLED', 'CANCELLED']),
  }),
});
