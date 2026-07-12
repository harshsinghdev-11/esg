import { z } from 'zod';

export const recalculateDepartmentScoreSchema = z.object({
  body: z.object({
    periodStart: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid period start',
    }).optional(),
    periodEnd: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid period end',
    }).optional(),
  }),
});
