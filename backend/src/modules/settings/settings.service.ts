import prisma from '../../config/db.js';
import { ValidationError } from '../../shared/utils/errors.js';

function toNumber(value: unknown, fallback: number) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return Number(value);
}

export const settingsService = {
  async getConfiguration(organizationId: string) {
    return prisma.esgConfiguration.upsert({
      where: { organizationId },
      update: {},
      create: { organizationId },
    });
  },

  async updateConfiguration(organizationId: string, data: any) {
    const current = await this.getConfiguration(organizationId);

    const mergedWeights = {
      environmentalWeightPct: toNumber(data.environmentalWeightPct, Number(current.environmentalWeightPct)),
      socialWeightPct: toNumber(data.socialWeightPct, Number(current.socialWeightPct)),
      governanceWeightPct: toNumber(data.governanceWeightPct, Number(current.governanceWeightPct)),
    };

    const totalWeight =
      mergedWeights.environmentalWeightPct +
      mergedWeights.socialWeightPct +
      mergedWeights.governanceWeightPct;

    if (Math.abs(totalWeight - 100) > 0.001) {
      throw new ValidationError('Environmental, social, and governance weights must sum to 100');
    }

    return prisma.esgConfiguration.upsert({
      where: { organizationId },
      update: {
        environmentalWeightPct: mergedWeights.environmentalWeightPct,
        socialWeightPct: mergedWeights.socialWeightPct,
        governanceWeightPct: mergedWeights.governanceWeightPct,
        ...(data.autoEmissionCalculationEnabled !== undefined
          ? { autoEmissionCalculationEnabled: data.autoEmissionCalculationEnabled }
          : {}),
        ...(data.evidenceRequiredEnabled !== undefined
          ? { evidenceRequiredEnabled: data.evidenceRequiredEnabled }
          : {}),
        ...(data.badgeAutoAwardEnabled !== undefined
          ? { badgeAutoAwardEnabled: data.badgeAutoAwardEnabled }
          : {}),
        ...(data.notifyInApp !== undefined ? { notifyInApp: data.notifyInApp } : {}),
        ...(data.notifyEmail !== undefined ? { notifyEmail: data.notifyEmail } : {}),
      },
      create: {
        organizationId,
        environmentalWeightPct: mergedWeights.environmentalWeightPct,
        socialWeightPct: mergedWeights.socialWeightPct,
        governanceWeightPct: mergedWeights.governanceWeightPct,
        autoEmissionCalculationEnabled: data.autoEmissionCalculationEnabled ?? true,
        evidenceRequiredEnabled: data.evidenceRequiredEnabled ?? true,
        badgeAutoAwardEnabled: data.badgeAutoAwardEnabled ?? true,
        notifyInApp: data.notifyInApp ?? true,
        notifyEmail: data.notifyEmail ?? false,
      },
    });
  },
};
