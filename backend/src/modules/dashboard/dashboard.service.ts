import prisma from '../../config/db.js';
import { ApprovalStatus, EmployeeStatus, LifecycleStatus, RecordStatus } from '../../generated/prisma/index.js';
import { resolveScorePeriod, scoresService } from '../scores/scores.service.js';

function groupByTimeframe(rows: Array<{ date: Date; value: number }>, periodLengthDays: number) {
  const grouped = new Map<string, number>();
  const useMonthly = periodLengthDays > 45;

  for (const row of rows) {
    const date = new Date(row.date);
    const key = useMonthly
      ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      : date.toISOString().slice(0, 10);

    grouped.set(key, Number(((grouped.get(key) ?? 0) + row.value).toFixed(2)));
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, value]) => ({ label, value }));
}

export const dashboardService = {
  async getEnvironmentalSummary(organizationId: string, query: any) {
    const period = resolveScorePeriod(query);
    const periodLengthDays =
      (period.periodEnd.getTime() - period.periodStart.getTime()) / (1000 * 60 * 60 * 24) + 1;

    const [transactions, goals, totalEmissionsAggregate, bySource] = await Promise.all([
      prisma.carbonTransaction.findMany({
        where: {
          organizationId,
          transactionDate: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
        select: {
          transactionDate: true,
          co2eEmitted: true,
        },
        orderBy: {
          transactionDate: 'asc',
        },
      }),
      prisma.environmentalGoal.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          targetDate: 'asc',
        },
      }),
      prisma.carbonTransaction.aggregate({
        where: {
          organizationId,
          transactionDate: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
        _sum: {
          co2eEmitted: true,
        },
      }),
      prisma.carbonTransaction.groupBy({
        by: ['sourceType'],
        where: {
          organizationId,
          transactionDate: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
        _sum: {
          co2eEmitted: true,
        },
      }),
    ]);

    return {
      period,
      totalCo2eEmitted: Number(totalEmissionsAggregate._sum.co2eEmitted ?? 0),
      emissionsTrend: groupByTimeframe(
        transactions.map((transaction) => ({
          date: transaction.transactionDate,
          value: Number(transaction.co2eEmitted),
        })),
        periodLengthDays,
      ),
      emissionsBySource: bySource.map((item) => ({
        sourceType: item.sourceType,
        totalCo2eEmitted: Number(item._sum.co2eEmitted ?? 0),
      })),
      goalsProgress: goals.map((goal) => ({
        ...goal,
        progressPct:
          Number(goal.targetValue) > 0
            ? Math.min(100, Number(((Number(goal.currentValue) / Number(goal.targetValue)) * 100).toFixed(2)))
            : 0,
      })),
    };
  },

  async getSocialSummary(organizationId: string, query: any) {
    const period = resolveScorePeriod(query);

    const [employeeCount, approvedCsrCount, approvedChallengeCount, activitiesCount, challengesCount] = await Promise.all([
      prisma.employee.count({
        where: {
          organizationId,
          status: EmployeeStatus.ACTIVE,
        },
      }),
      prisma.employeeParticipation.count({
        where: {
          approvalStatus: ApprovalStatus.APPROVED,
          employee: {
            organizationId,
          },
          createdAt: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
      }),
      prisma.challengeParticipation.count({
        where: {
          approvalStatus: ApprovalStatus.APPROVED,
          employee: {
            organizationId,
          },
          createdAt: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
      }),
      prisma.csrActivity.count({
        where: {
          organizationId,
          activityDate: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
      }),
      prisma.challenge.count({
        where: {
          organizationId,
          createdAt: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
      }),
    ]);

    const csrParticipationRate = employeeCount > 0 ? (approvedCsrCount / employeeCount) * 100 : 0;
    const challengeParticipationRate = employeeCount > 0 ? (approvedChallengeCount / employeeCount) * 100 : 0;

    return {
      period,
      employeeCount,
      csrActivitiesCount: activitiesCount,
      challengesCount,
      approvedCsrParticipations: approvedCsrCount,
      approvedChallengeParticipations: approvedChallengeCount,
      csrParticipationRate: Number(csrParticipationRate.toFixed(2)),
      challengeParticipationRate: Number(challengeParticipationRate.toFixed(2)),
      combinedSocialEngagementRate: Number((((csrParticipationRate + challengeParticipationRate) / 2)).toFixed(2)),
    };
  },

  async getGovernanceSummary(organizationId: string, query: any) {
    const period = resolveScorePeriod(query);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [audits, openIssues, overdueIssues, activePolicies, activeEmployees, acknowledgements] = await Promise.all([
      prisma.audit.groupBy({
        by: ['status'],
        where: {
          organizationId,
          OR: [
            {
              scheduledDate: {
                gte: period.periodStart,
                lte: period.periodEnd,
              },
            },
            {
              completedDate: {
                gte: period.periodStart,
                lte: period.periodEnd,
              },
            },
          ],
        },
        _count: {
          _all: true,
        },
      }),
      prisma.complianceIssue.count({
        where: {
          audit: {
            organizationId,
          },
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'OVERDUE'],
          },
        },
      }),
      prisma.complianceIssue.count({
        where: {
          audit: {
            organizationId,
          },
          OR: [
            { status: 'OVERDUE' },
            {
              status: 'OPEN',
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
            status: EmployeeStatus.ACTIVE,
          },
        },
      }),
    ]);

    const totalRequiredAcknowledgements = activePolicies * activeEmployees;
    const acknowledgementRate =
      totalRequiredAcknowledgements > 0
        ? (acknowledgements / totalRequiredAcknowledgements) * 100
        : 100;

    return {
      period,
      auditsByStatus: audits.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      openIssues,
      overdueIssues,
      activePolicies,
      acknowledgementRate: Number(acknowledgementRate.toFixed(2)),
    };
  },

  async getGamificationSummary(organizationId: string, query: any) {
    const period = resolveScorePeriod(query);

    const [activeChallenges, topPerformers, badgeCount, redemptionCount] = await Promise.all([
      prisma.challenge.count({
        where: {
          organizationId,
          status: {
            in: [LifecycleStatus.ACTIVE, LifecycleStatus.UNDER_REVIEW],
          },
        },
      }),
      prisma.employee.findMany({
        where: {
          organizationId,
          status: EmployeeStatus.ACTIVE,
        },
        orderBy: [{ totalXp: 'desc' }, { totalPointsBalance: 'desc' }],
        take: 10,
        select: {
          employeeId: true,
          fullName: true,
          totalXp: true,
          totalPointsBalance: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.employeeBadge.count({
        where: {
          badge: {
            organizationId,
          },
          awardedAt: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
      }),
      prisma.rewardRedemption.count({
        where: {
          reward: {
            organizationId,
          },
          redeemedAt: {
            gte: period.periodStart,
            lte: period.periodEnd,
          },
        },
      }),
    ]);

    return {
      period,
      activeChallenges,
      badgesAwarded: badgeCount,
      rewardRedemptions: redemptionCount,
      topPerformers,
    };
  },

  async getOverview(organizationId: string, query: any) {
    const [organizationScore, environmental, social, governance, gamification] = await Promise.all([
      scoresService.getOrganizationScore(organizationId),
      this.getEnvironmentalSummary(organizationId, query),
      this.getSocialSummary(organizationId, query),
      this.getGovernanceSummary(organizationId, query),
      this.getGamificationSummary(organizationId, query),
    ]);

    return {
      organizationScore,
      environmental,
      social,
      governance,
      gamification,
    };
  },
};
