import { z } from 'zod';

export const updateEsgConfigSchema = z.object({
  environmentalWeightPct: z.number().min(0).max(100).optional(),
  socialWeightPct: z.number().min(0).max(100).optional(),
  governanceWeightPct: z.number().min(0).max(100).optional(),
  autoEmissionCalculationEnabled: z.boolean().optional(),
  evidenceRequiredEnabled: z.boolean().optional(),
  badgeAutoAwardEnabled: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
}).refine(data => {
  const { environmentalWeightPct, socialWeightPct, governanceWeightPct } = data;
  
  if (environmentalWeightPct !== undefined || socialWeightPct !== undefined || governanceWeightPct !== undefined) {
    if (environmentalWeightPct === undefined || socialWeightPct === undefined || governanceWeightPct === undefined) {
      // For simplicity, require all three if any is updated
      return false;
    }
    return (environmentalWeightPct + socialWeightPct + governanceWeightPct) === 100;
  }
  return true;
}, "Weights must sum to 100 if provided");

export type UpdateEsgConfigDto = z.infer<typeof updateEsgConfigSchema>;
