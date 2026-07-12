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
