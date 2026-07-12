import { z } from 'zod';

export const joinChallengeSchema = z.object({
  body: z.object({
    proofUrl: z.string().url('Invalid URL').optional().nullable(),
  }),
});

export const updateChallengeProgressSchema = z.object({
  body: z.object({
    progressPct: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, { message: 'Progress must be a number between 0 and 100' }),
    proofUrl: z.string().url('Invalid URL').optional().nullable(),
  }),
});
