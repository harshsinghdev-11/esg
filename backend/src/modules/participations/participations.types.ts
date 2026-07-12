import { z } from 'zod';

export const participateSchema = z.object({
  body: z.object({
    proofUrl: z.string().url('Invalid URL').optional().nullable(),
  }),
});
