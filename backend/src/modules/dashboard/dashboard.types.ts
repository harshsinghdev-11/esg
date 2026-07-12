import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  query: z.object({
    period_start: z.string().optional(),
    period_end: z.string().optional(),
  }).optional(),
});
