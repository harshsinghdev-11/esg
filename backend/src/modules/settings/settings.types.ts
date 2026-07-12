import { z } from 'zod';

export const updateEsgConfigurationSchema = z.object({
  body: z.object({
    environmentalWeightPct: z.union([z.number(), z.string()]).optional(),
    socialWeightPct: z.union([z.number(), z.string()]).optional(),
    governanceWeightPct: z.union([z.number(), z.string()]).optional(),
    autoEmissionCalculationEnabled: z.boolean().optional(),
    evidenceRequiredEnabled: z.boolean().optional(),
    badgeAutoAwardEnabled: z.boolean().optional(),
    notifyInApp: z.boolean().optional(),
    notifyEmail: z.boolean().optional(),
  }),
});
