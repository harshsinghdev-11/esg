import { z } from 'zod';

export const createChallengeSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid UUID format'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    xp: z.number().int().min(0, 'XP must be a positive integer').optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
    evidenceRequired: z.boolean().optional(),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional().nullable(),
  }),
});

export const updateChallengeSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid UUID format').optional(),
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    xp: z.number().int().min(0).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
    evidenceRequired: z.boolean().optional(),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional().nullable(),
    status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED']).optional(),
  }),
});
