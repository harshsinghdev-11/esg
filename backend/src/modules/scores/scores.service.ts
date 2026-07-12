import prisma from '../../config/db.js';
import { ApprovalStatus, DepartmentStatus, EmployeeStatus, IssueStatus, RecordStatus } from '../../generated/prisma/index.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';

type ScorePeriod = {
  periodStart: Date;
  periodEnd: Date;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

async function ensureDepartmentBelongsToOrganization(organizationId: string, departmentId: string) {
  const department = await prisma.department.findFirst({
    where: {
      departmentId,
      organizationId,
    },
    select: {
      departmentId: true,
      name: true,
    },
  });

  if (!department) {
    throw new NotFoundError('Department not found');
  }

  return department;
}

async function ensureConfiguration(organizationId: string) {
  return prisma.esgConfiguration.upsert({
    where: { organizationId },
    update: {},
    create: {
      organizationId,
    },
  });
}

export function resolveScorePeriod(input: any = {}): ScorePeriod {
  const periodStartValue = input.periodStart ?? input.period_start;
  const periodEndValue = input.periodEnd ?? input.period_end;

  if (periodStartValue || periodEndValue) {
    if (!periodStartValue || !periodEndValue) {
      throw new ValidationError('Both periodStart and periodEnd are required together');
    }

    const periodStart = new Date(periodStartValue);
    const periodEnd = new Date(periodEndValue);

    if (periodStart > periodEnd) {
      throw new ValidationError('periodStart cannot be after periodEnd');
    }

    return { periodStart, periodEnd };
  }

  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { periodStart, periodEnd };
}

async function calculateEnvironmentalScore(organizationId: string, departmentId: string, period: ScorePeriod) {
  const [emissionsAggregate, departmentGoals, organizationGoals] = await Promise.all([
    prisma.carbonTransaction.aggregate({
      where: {
        organizationId,
        departmentId,
        transactionDate: {
          gte: period.periodStart,
          lte: period.periodEnd,
        },
      },
      _sum: {
        co2eEmitted: true,
      },
    }),
    prisma.environmentalGoal.findMany({
      where: {
        organizationId,
        departmentId,
        startDate: {
          lte: period.periodEnd,
        },
        targetDate: {
          gte: period.periodStart,
        },
      },
      select: {
        targetValue: true,
      },
    }),
    prisma.environmentalGoal.findMany({
      where: {
        organizationId,
        departmentId: null,
        startDate: {
          lte: period.periodEnd,
        },
        targetDate: {
          gte: period.periodStart,
        },
      },
      select: {
        targetValue: true,
      },
    }),
  ]);

  const actualEmissions = Number(emissionsAggregate._sum.co2eEmitted ?? 0);
  const applicableGoals = departmentGoals.length > 0 ? departmentGoals : organizationGoals;
  const targetCo2e = applicableGoals.reduce((sum, goal) => sum + Number(goal.targetValue), 0);

  if (targetCo2e <= 0) {
    return actualEmissions === 0 ? 100 : 0;
  }

  return clampScore(100 * (1 - actualEmissions / targetCo2e));
}

async function calculateSocialScore(organizationId: string, departmentId: string, period: ScorePeriod) {
  const [employeeCount, csrApprovedCount, challengeApprovedCount] = await Promise.all([
    prisma.employee.count({
      where: {
        organizationId,
        departmentId,
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.employeeParticipation.count({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        employee: {
          organizationId,
          departmentId,
        },
        OR: [
          {
            completionDate: {
              gte: period.periodStart,
              lte: period.periodEnd,
            },
          },
          {
            completionDate: null,
            createdAt: {
              gte: period.periodStart,
              lte: period.periodEnd,
            },
          },
        ],
      },
    }),
    prisma.challengeParticipation.count({
      where: {
        approvalStatus: ApprovalStatus.APPROVED,
        employee: {
          organizationId,
          departmentId,
        },
        createdAt: {
          gte: period.periodStart,
          lte: period.periodEnd,
        },
      },
    }),
  ]);

  if (employeeCount === 0) {
    return 0;
  }

  const csrRate = csrApprovedCount / employeeCount;
  const challengeRate = challengeApprovedCount / employeeCount;
  return clampScore(((csrRate + challengeRate) / 2) * 100);
}

async function calculateGovernanceScore(organizationId: string, departmentId: string) {
  const today = startOfToday();

  const [overdueIssuesCount, activePolicyCount, departmentEmployeeCount, acknowledgementCount] = await Promise.all([
    prisma.complianceIssue.count({
      where: {
        audit: {
          organizationId,
          departmentId,
        },
        OR: [
          { status: IssueStatus.OVERDUE },
          {
            status: IssueStatus.OPEN,
            dueDate: {
              lt: today,
            },
          },
        ],
      },
    }),
    prisma.esgPolicy.count({
      where: {
        organizationId,
        status: RecordStatus.ACTIVE,
      },
    }),
    prisma.employee.count({
      where: {
        organizationId,
        departmentId,
        status: EmployeeStatus.ACTIVE,
      },
    }),
    prisma.policyAcknowledgement.count({
      where: {
        esgPolicy: {
          organizationId,
          status: RecordStatus.ACTIVE,
        },
        employee: {
          organizationId,
          departmentId,
        },
      },
    }),
  ]);

  const totalRequiredAcknowledgements = activePolicyCount * departmentEmployeeCount;
  const missingAcknowledgementPct =
    totalRequiredAcknowledgements > 0
      ? (totalRequiredAcknowledgements - acknowledgementCount) / totalRequiredAcknowledgements
      : 0;

  return clampScore(100 - overdueIssuesCount * 10 - missingAcknowledgementPct * 100);
}

export async function recalculateDepartmentScore(
  organizationId: string,
  departmentId: string,
  periodInput?: any,
) {
  const period = resolveScorePeriod(periodInput);
  await ensureDepartmentBelongsToOrganization(organizationId, departmentId);

  const [config, environmentalScore, socialScore, governanceScore] = await Promise.all([
    ensureConfiguration(organizationId),
    calculateEnvironmentalScore(organizationId, departmentId, period),
    calculateSocialScore(organizationId, departmentId, period),
    calculateGovernanceScore(organizationId, departmentId),
  ]);

  const environmentalWeight = Number(config.environmentalWeightPct);
  const socialWeight = Number(config.socialWeightPct);
  const governanceWeight = Number(config.governanceWeightPct);

  const totalScore = clampScore(
    environmentalScore * (environmentalWeight / 100) +
      socialScore * (socialWeight / 100) +
      governanceScore * (governanceWeight / 100),
  );

  return prisma.departmentScore.upsert({
    where: {
      departmentId_periodStart_periodEnd: {
        departmentId,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
      },
    },
    update: {
      environmentalScore,
      socialScore,
      governanceScore,
      totalScore,
      calculatedAt: new Date(),
    },
    create: {
      departmentId,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      environmentalScore,
      socialScore,
      governanceScore,
      totalScore,
    },
    include: {
      department: true,
    },
  });
}

async function getLatestDepartmentScores(organizationId: string) {
  const departments = await prisma.department.findMany({
    where: {
      organizationId,
      status: DepartmentStatus.ACTIVE,
    },
    select: {
      departmentId: true,
      name: true,
    },
  });

  const latestScores = await Promise.all(
    departments.map(async (department) => {
      const score = await prisma.departmentScore.findFirst({
        where: {
          departmentId: department.departmentId,
        },
        orderBy: [{ periodEnd: 'desc' }, { calculatedAt: 'desc' }],
      });

      if (!score) {
        return null;
      }

      return {
        departmentId: department.departmentId,
        departmentName: department.name,
        environmentalScore: Number(score.environmentalScore),
        socialScore: Number(score.socialScore),
        governanceScore: Number(score.governanceScore),
        totalScore: Number(score.totalScore),
        periodStart: score.periodStart,
        periodEnd: score.periodEnd,
      };
    }),
  );

  return latestScores.filter((score): score is NonNullable<typeof score> => Boolean(score));
}

export const scoresService = {
  async listDepartmentScores(organizationId: string, query: any) {
    const { department_id, page = 1, limit = 20, period_start, period_end } = query;
    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const skip = (currentPage - 1) * currentLimit;

    const where = {
      department: {
        organizationId,
      },
      ...(department_id ? { departmentId: department_id as string } : {}),
      ...(period_start ? { periodStart: { gte: new Date(period_start as string) } } : {}),
      ...(period_end ? { periodEnd: { lte: new Date(period_end as string) } } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.departmentScore.findMany({
        where,
        skip,
        take: currentLimit,
        orderBy: [{ periodEnd: 'desc' }, { calculatedAt: 'desc' }],
        include: {
          department: true,
        },
      }),
      prisma.departmentScore.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  },

  async getDepartmentScore(organizationId: string, departmentId: string) {
    await ensureDepartmentBelongsToOrganization(organizationId, departmentId);

    const score = await prisma.departmentScore.findFirst({
      where: {
        departmentId,
      },
      orderBy: [{ periodEnd: 'desc' }, { calculatedAt: 'desc' }],
      include: {
        department: true,
      },
    });

    if (!score) {
      throw new NotFoundError('Department score not found');
    }

    return score;
  },

  async recalculateDepartment(organizationId: string, departmentId: string, body: any) {
    return recalculateDepartmentScore(organizationId, departmentId, body);
  },

  async getOrganizationScore(organizationId: string) {
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(
        'SELECT * FROM v_organization_score WHERE organization_id = $1',
        organizationId,
      );

      if (rows.length > 0) {
        return rows[0];
      }
    } catch (err) {
      console.warn('v_organization_score view unavailable, using fallback aggregation', err);
    }

    const [config, latestScores] = await Promise.all([
      ensureConfiguration(organizationId),
      getLatestDepartmentScores(organizationId),
    ]);

    if (latestScores.length === 0) {
      return {
        organizationId,
        environmentalScore: 0,
        socialScore: 0,
        governanceScore: 0,
        totalScore: 0,
        departmentCount: 0,
      };
    }

    const departmentCount = latestScores.length;
    const environmentalScore =
      latestScores.reduce((sum, score) => sum + score.environmentalScore, 0) / departmentCount;
    const socialScore = latestScores.reduce((sum, score) => sum + score.socialScore, 0) / departmentCount;
    const governanceScore =
      latestScores.reduce((sum, score) => sum + score.governanceScore, 0) / departmentCount;
    const totalScore = clampScore(
      environmentalScore * (Number(config.environmentalWeightPct) / 100) +
        socialScore * (Number(config.socialWeightPct) / 100) +
        governanceScore * (Number(config.governanceWeightPct) / 100),
    );

    return {
      organizationId,
      departmentCount,
      environmentalScore: clampScore(environmentalScore),
      socialScore: clampScore(socialScore),
      governanceScore: clampScore(governanceScore),
      totalScore,
      weights: {
        environmentalWeightPct: Number(config.environmentalWeightPct),
        socialWeightPct: Number(config.socialWeightPct),
        governanceWeightPct: Number(config.governanceWeightPct),
      },
    };
  },
};
