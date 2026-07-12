import prisma from '../../config/db.js';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/utils/errors.js';
import { ApprovalStatus, NotificationEventType } from '../../generated/prisma/index.js';
import { runBadgeAutoAward } from '../../jobs/badgeAutoAward.job.js';

export const challengeParticipationsService = {
  async join(organizationId: string, employeeId: string, challengeId: string, data: any) {
    const challenge = await prisma.challenge.findFirst({
      where: { challengeId, organizationId, status: 'ACTIVE' }
    });
    if (!challenge) throw new NotFoundError('Active Challenge not found');

    const existing = await prisma.challengeParticipation.findUnique({
      where: { challengeId_employeeId: { challengeId, employeeId } }
    });
    if (existing) throw new ConflictError('Already participating in this challenge');

    return prisma.challengeParticipation.create({
      data: {
        challengeId,
        employeeId,
        proofUrl: data.proofUrl,
        approvalStatus: ApprovalStatus.PENDING,
      }
    });
  },

  async updateProgress(organizationId: string, id: string, data: any) {
    const participation = await prisma.challengeParticipation.findFirst({
      where: { challengeParticipationId: id },
      include: { challenge: true }
    });
    
    if (!participation || participation.challenge.organizationId !== organizationId) {
      throw new NotFoundError('Challenge participation not found');
    }
    if (participation.approvalStatus === ApprovalStatus.APPROVED) {
      throw new ConflictError('Cannot update progress of an approved participation');
    }

    const updateData: any = {};
    if (data.progressPct !== undefined) updateData.progressPct = data.progressPct;
    if (data.proofUrl !== undefined) updateData.proofUrl = data.proofUrl;

    return prisma.challengeParticipation.update({
      where: { challengeParticipationId: id },
      data: updateData
    });
  },

  async list(organizationId: string, query: any, currentUser: any) {
    const { employeeId, challengeId, approvalStatus, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { challenge: { organizationId } };
    
    // Employee sees own, admin sees all
    if (currentUser.role === 'EMPLOYEE') {
      where.employeeId = currentUser.employeeId;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (challengeId) where.challengeId = challengeId;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const [data, total] = await Promise.all([
      prisma.challengeParticipation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { challenge: true, employee: true }
      }),
      prisma.challengeParticipation.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getById(organizationId: string, id: string) {
    const participation = await prisma.challengeParticipation.findFirst({
      where: { challengeParticipationId: id },
      include: { 
        challenge: true, 
        employee: true 
      }
    });
    
    if (!participation || participation.challenge.organizationId !== organizationId) {
      throw new NotFoundError('Challenge participation not found');
    }
    return participation;
  },

  async approve(organizationId: string, id: string, approverId: string) {
    const participation = await prisma.challengeParticipation.findFirst({
      where: { challengeParticipationId: id },
      include: { challenge: true, employee: true }
    });
    
    if (!participation || participation.challenge.organizationId !== organizationId) {
      throw new NotFoundError('Challenge participation not found');
    }
    if (participation.approvalStatus !== ApprovalStatus.PENDING) {
      throw new ConflictError('Participation is not pending');
    }
    if (Number(participation.progressPct) < 100) {
      throw new ValidationError('Cannot approve challenge before 100% progress is reached');
    }

    const orgConfig = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });
    
    const orgEvidenceRequired = orgConfig?.evidenceRequiredEnabled || false;
    const effectiveRequirement = participation.challenge.evidenceRequired || orgEvidenceRequired;

    if (effectiveRequirement && !participation.proofUrl) {
      throw new ValidationError('Cannot approve without proof: evidence is required for this challenge');
    }

    const xpAwarded = participation.challenge.xp;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update participation
      const p = await tx.challengeParticipation.update({
        where: { challengeParticipationId: id },
        data: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedBy: approverId,
          xpAwarded,
        }
      });

      // 2. Increment employee XP
      await tx.employee.update({
        where: { employeeId: participation.employeeId },
        data: {
          totalXp: { increment: xpAwarded }
        }
      });

      // 3. Trigger Notification
      if (orgConfig?.notifyInApp) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientEmployeeId: participation.employeeId,
            eventType: NotificationEventType.CHALLENGE_APPROVAL_DECISION,
            title: 'Challenge Approved',
            message: `Your participation in ${participation.challenge.title} was approved. You earned ${xpAwarded} XP!`,
            relatedEntityType: 'CHALLENGE_PARTICIPATION',
            relatedEntityId: id
          }
        });
      }
      return p;
    });

    // 4. Trigger badge auto-award out-of-band
    await runBadgeAutoAward(participation.employeeId, organizationId).catch(console.error);

    return updated;
  },

  async reject(organizationId: string, id: string, approverId: string) {
    const participation = await prisma.challengeParticipation.findFirst({
      where: { challengeParticipationId: id },
      include: { challenge: true, employee: true }
    });
    
    if (!participation || participation.challenge.organizationId !== organizationId) {
      throw new NotFoundError('Challenge participation not found');
    }
    if (participation.approvalStatus !== ApprovalStatus.PENDING) {
      throw new ConflictError('Participation is not pending');
    }

    const updated = await prisma.challengeParticipation.update({
      where: { challengeParticipationId: id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedBy: approverId,
      }
    });

    const orgConfig = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });

    if (orgConfig?.notifyInApp) {
      await prisma.notification.create({
        data: {
          organizationId,
          recipientEmployeeId: participation.employeeId,
          eventType: NotificationEventType.CHALLENGE_APPROVAL_DECISION,
          title: 'Challenge Participation Rejected',
          message: `Your participation in ${participation.challenge.title} was rejected.`,
          relatedEntityType: 'CHALLENGE_PARTICIPATION',
          relatedEntityId: id
        }
      });
    }

    return updated;
  }
};
