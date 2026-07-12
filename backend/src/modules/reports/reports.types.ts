import { z } from 'zod';

export const createCustomReportSchema = z.object({
  body: z.object({
    module: z.enum(['environmental', 'social', 'governance', 'gamification']).optional(),
    department_id: z.string().uuid('Invalid UUID format').optional(),
    employee_id: z.string().uuid('Invalid UUID format').optional(),
    challenge_id: z.string().uuid('Invalid UUID format').optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional(),
    esg_category: z.string().optional(),
  }),
});

export const exportReportQuerySchema = z.object({
  query: z.object({
    format: z.enum(['pdf', 'excel', 'csv']),
  }),
});
