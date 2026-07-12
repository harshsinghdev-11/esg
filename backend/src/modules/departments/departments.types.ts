import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    parentDepartmentId: z.string().uuid('Invalid UUID format').optional(),
    headEmployeeId: z.string().uuid('Invalid UUID format').optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    parentDepartmentId: z.string().uuid().optional().nullable(),
    headEmployeeId: z.string().uuid().optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});
