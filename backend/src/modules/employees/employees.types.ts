import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    employeeCode: z.string().min(1, 'Employee code is required'),
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email format'),
    departmentId: z.string().uuid('Invalid UUID format').optional(),
    role: z.enum(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD', 'AUDITOR', 'EMPLOYEE']).optional(),
  }),
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).optional(),
    departmentId: z.string().uuid().optional().nullable(),
    role: z.enum(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD', 'AUDITOR', 'EMPLOYEE']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
  }),
});
