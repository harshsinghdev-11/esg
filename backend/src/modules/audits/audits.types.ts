import { z } from 'zod';

const auditStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

export const createAuditSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    auditType: z.string().min(1).optional().nullable(),
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    scheduledDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid scheduled date',
    }).optional().nullable(),
    completedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid completed date',
    }).optional().nullable(),
    status: auditStatusEnum.optional(),
    findingsSummary: z.string().optional().nullable(),
  }),
});

export const updateAuditSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    auditType: z.string().min(1).optional().nullable(),
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    scheduledDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid scheduled date',
    }).optional().nullable(),
    completedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid completed date',
    }).optional().nullable(),
    status: auditStatusEnum.optional(),
    findingsSummary: z.string().optional().nullable(),
  }),
});
