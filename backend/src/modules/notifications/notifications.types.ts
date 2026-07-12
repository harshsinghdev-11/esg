import { z } from 'zod';

export const notificationQuerySchema = z.object({
  query: z.object({
    is_read: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }).optional(),
});
