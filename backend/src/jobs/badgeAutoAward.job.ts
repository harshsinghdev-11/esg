import prisma from '../config/db.js';
import { NotificationEventType } from '../generated/prisma/index.js';

export async function runBadgeAutoAward(employeeId: string, organizationId: string) {
  try {
    const config = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });

    if (!config || !config.badgeAutoAwardEnabled) {
      return { awardedCount: 0 };
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId }
    });

    if (!employee) return { awardedCount: 0 };

    // Get candidate badges the employee doesn't already have
    const candidateBadges = await prisma.badge.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
        employeeBadges: {
          none: { employeeId }
        }
      }
    });

    if (candidateBadges.length === 0) {
      return { awardedCount: 0 };
    }

    // Resolve completed challenge count if needed by any badge
    let completedChallengeCount: number | null = null;
    const needsChallengeCount = candidateBadges.some(b => 
      (b.unlockRule as any)?.metric === 'completed_challenge_count'
    );

    if (needsChallengeCount) {
      completedChallengeCount = await prisma.challengeParticipation.count({
        where: {
          employeeId,
          approvalStatus: 'APPROVED'
        }
      });
    }

    let awardedCount = 0;

    for (const badge of candidateBadges) {
      const rule = badge.unlockRule as any;
      if (!rule || !rule.metric || !rule.operator || rule.value === undefined) continue;

      let actualValue = 0;
      switch (rule.metric) {
        case 'total_xp':
          actualValue = employee.totalXp;
          break;
        case 'total_points_balance':
          actualValue = employee.totalPointsBalance;
          break;
        case 'completed_challenge_count':
          actualValue = completedChallengeCount || 0;
          break;
        default:
          continue;
      }

      const targetValue = Number(rule.value);
      let conditionMet = false;

      switch (rule.operator) {
        case '>=': conditionMet = actualValue >= targetValue; break;
        case '>': conditionMet = actualValue > targetValue; break;
        case '==': conditionMet = actualValue === targetValue; break;
        case '<=': conditionMet = actualValue <= targetValue; break;
        case '<': conditionMet = actualValue < targetValue; break;
      }

      if (conditionMet) {
        await prisma.$transaction(async (tx) => {
          await tx.employeeBadge.create({
            data: {
              employeeId,
              badgeId: badge.badgeId
            }
          });

          if (config.notifyInApp) {
            await tx.notification.create({
              data: {
                organizationId,
                recipientEmployeeId: employeeId,
                eventType: NotificationEventType.BADGE_UNLOCKED,
                title: 'Badge Unlocked!',
                message: `Congratulations! You unlocked the ${badge.name} badge.`,
                relatedEntityType: 'BADGE',
                relatedEntityId: badge.badgeId
              }
            });
          }
        });
        awardedCount++;
      }
    }

    return { awardedCount };
  } catch (err) {
    console.error(`[Job: BadgeAutoAward] Failed for employee ${employeeId}:`, err);
    throw err;
  }
}
