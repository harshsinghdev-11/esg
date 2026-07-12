import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    organizationName: z.string().min(1, 'Organization name is required'),
    adminName: z.string().min(1, 'Admin name is required'),
    adminEmail: z.string().email('Invalid email format'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});
import { z } from 'zod';

export const createBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    iconUrl: z.string().url('Invalid URL').optional().nullable(),
    unlockRule: z.object({
      metric: z.enum(['total_xp', 'total_points_balance', 'completed_challenge_count']),
      operator: z.enum(['>=', '>', '==', '<=', '<']),
      value: z.number(),
    }),
  }),
});

export const updateBadgeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    iconUrl: z.string().url().optional().nullable(),
    unlockRule: z.object({
      metric: z.enum(['total_xp', 'total_points_balance', 'completed_challenge_count']),
      operator: z.enum(['>=', '>', '==', '<=', '<']),
      value: z.number(),
    }).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});
import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['CSR_ACTIVITY', 'CHALLENGE']),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});
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
import { z } from 'zod';

export const createEmissionFactorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    unit: z.string().min(1, 'Unit is required'),
    co2ePerUnit: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'co2ePerUnit must be a number' }),
    source: z.string().optional().nullable(),
    validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    validTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional().nullable(),
  }),
});

export const updateEmissionFactorSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    unit: z.string().min(1).optional(),
    co2ePerUnit: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'co2ePerUnit must be a number' }).optional(),
    source: z.string().optional().nullable(),
    validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    validTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});
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
import { z } from 'zod';

export const createEnvironmentalGoalSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    title: z.string().min(1, 'Title is required'),
    metric: z.string().min(1, 'Metric is required'),
    targetValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'targetValue must be a number' }),
    currentValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'currentValue must be a number' }).optional(),
    unit: z.string().min(1, 'Unit is required'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
    targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
  }),
});

export const updateEnvironmentalGoalSchema = z.object({
  body: z.object({
    departmentId: z.string().uuid('Invalid UUID format').optional().nullable(),
    title: z.string().min(1).optional(),
    metric: z.string().min(1).optional(),
    targetValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'targetValue must be a number' }).optional(),
    currentValue: z.union([z.number(), z.string()]).refine((val) => !isNaN(Number(val)), { message: 'currentValue must be a number' }).optional(),
    unit: z.string().min(1).optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'ACHIEVED', 'MISSED']).optional(),
  }),
});
import { z } from 'zod';

export const createPolicySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    version: z.string().optional(),
    documentUrl: z.string().url('Invalid URL').optional().nullable(),
    effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }),
  }),
});

export const updatePolicySchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    version: z.string().optional(),
    documentUrl: z.string().url().optional().nullable(),
    effectiveDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date string' }).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});
import { z } from 'zod';

export const createRewardSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    pointsRequired: z.number().int().min(0, 'Points required must be a positive integer'),
    stock: z.number().int().min(0).optional(),
  }),
});

export const updateRewardSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    pointsRequired: z.number().int().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  }),
});

export const updateRedemptionSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'FULFILLED', 'CANCELLED']),
  }),
});
