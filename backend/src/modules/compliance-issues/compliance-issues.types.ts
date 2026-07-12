import { z } from 'zod';

const issueSeverityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
const issueStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'OVERDUE', 'CLOSED']);

export const createComplianceIssueSchema = z.object({
  body: z.object({
    auditId: z.string().uuid('Invalid UUID format'),
    severity: issueSeverityEnum,
    description: z.string().min(1, 'Description is required'),
    ownerEmployeeId: z.string().uuid('Invalid UUID format'),
    dueDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid due date',
    }),
  }),
});

export const updateComplianceIssueSchema = z.object({
  body: z.object({
    severity: issueSeverityEnum.optional(),
    description: z.string().min(1).optional(),
    ownerEmployeeId: z.string().uuid('Invalid UUID format').optional(),
    dueDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid due date',
    }).optional(),
    status: issueStatusEnum.optional(),
    resolvedDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'Invalid resolved date',
    }).optional().nullable(),
  }),
});
