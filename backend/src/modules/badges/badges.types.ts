import { z } from 'zod';

export const createBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    iconUrl: z.string().url('Invalid URL').optional().nullable(),
    unlockRule: z.object({
      metric: z.enum(['total_xp', 'total_points_balance', 'completed_challenge_count']),
      operator: z.enum(['>=', '>', '==', '<=', '<']),
      value: z.number(),
    }),
  }),
});

export const updateBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    iconUrl: z.string().url().optional().nullable(),
    unlockRule: z.object({
      metric: z.enum(['total_xp', 'total_points_balance', 'completed_challenge_count']),
      operator: z.enum(['>=', '>', '==', '<=', '<']),
      value: z.number(),
    }).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});
