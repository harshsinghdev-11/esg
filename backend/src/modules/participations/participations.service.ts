import prisma from '../../config/db.js';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/utils/errors.js';
import { ApprovalStatus, NotificationEventType } from '../../generated/prisma/index.js';
import { runBadgeAutoAward } from '../../jobs/badgeAutoAward.job.js';

export const participationsService = {
  async participate(organizationId: string, employeeId: string, activityId: string, data: any) {
    const activity = await prisma.csrActivity.findFirst({
      where: { csrActivityId: activityId, organizationId, status: 'ACTIVE' }
    });
    if (!activity) throw new NotFoundError('Active CSR Activity not found');

    const existing = await prisma.employeeParticipation.findUnique({
      where: { csrActivityId_employeeId: { csrActivityId: activityId, employeeId } }
    });
    if (existing) throw new ConflictError('Already participating in this activity');

    return prisma.employeeParticipation.create({
      data: {
        csrActivityId: activityId,
        employeeId,
        proofUrl: data.proofUrl,
        approvalStatus: ApprovalStatus.PENDING,
      }
    });
  },

  async list(organizationId: string, query: any, currentUser: any) {
    const { employeeId, csrActivityId, approvalStatus, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { csrActivity: { organizationId } };
    
    // Employee sees own, admin sees all
    if (currentUser.role === 'EMPLOYEE') {
      where.employeeId = currentUser.employeeId;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }
    
    if (csrActivityId) where.csrActivityId = csrActivityId;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const [data, total] = await Promise.all([
      prisma.employeeParticipation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { csrActivity: true, employee: true }
      }),
      prisma.employeeParticipation.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getById(organizationId: string, id: string) {
    const participation = await prisma.employeeParticipation.findFirst({
      where: { employeeParticipationId: id },
      include: { 
        csrActivity: true, 
        employee: true 
      }
    });
    
    if (!participation || participation.csrActivity.organizationId !== organizationId) {
      throw new NotFoundError('Participation not found');
    }
    return participation;
  },

  async approve(organizationId: string, id: string, approverId: string) {
    const participation = await prisma.employeeParticipation.findFirst({
      where: { employeeParticipationId: id },
      include: { csrActivity: true, employee: true }
    });
    
    if (!participation || participation.csrActivity.organizationId !== organizationId) {
      throw new NotFoundError('Participation not found');
    }
    if (participation.approvalStatus !== ApprovalStatus.PENDING) {
      throw new ConflictError('Participation is not pending');
    }

    const orgConfig = await prisma.esgConfiguration.findUnique({
      where: { organizationId }
    });
    
    const orgEvidenceRequired = orgConfig?.evidenceRequiredEnabled || false;
    const effectiveRequirement = participation.csrActivity.evidenceRequired || orgEvidenceRequired;

    if (effectiveRequirement && !participation.proofUrl) {
      throw new ValidationError('Cannot approve without proof: evidence is required for this activity');
    }

    const pointsEarned = participation.csrActivity.pointsValue;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update participation
      const p = await tx.employeeParticipation.update({
        where: { employeeParticipationId: id },
        data: {
          approvalStatus: ApprovalStatus.APPROVED,
          approvedBy: approverId,
          approvedAt: new Date(),
          pointsEarned,
          completionDate: new Date()
        }
      });

      // 2. Increment employee points
      await tx.employee.update({
        where: { employeeId: participation.employeeId },
        data: {
          totalPointsBalance: { increment: pointsEarned }
        }
      });

      // 3. Trigger Notification
      if (orgConfig?.notifyInApp) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientEmployeeId: participation.employeeId,
            eventType: NotificationEventType.CSR_APPROVAL_DECISION,
            title: 'CSR Participation Approved',
            message: `Your participation in ${participation.csrActivity.title} was approved. You earned ${pointsEarned} points!`,
            relatedEntityType: 'EMPLOYEE_PARTICIPATION',
            relatedEntityId: id
          }
        });
      }
      return p;
    });

    // 4. Trigger badge auto-award out-of-band (or await it)
    await runBadgeAutoAward(participation.employeeId, organizationId).catch(console.error);

    return updated;
  },

  async reject(organizationId: string, id: string, approverId: string) {
    const participation = await prisma.employeeParticipation.findFirst({
      where: { employeeParticipationId: id },
      include: { csrActivity: true, employee: true }
    });
    
    if (!participation || participation.csrActivity.organizationId !== organizationId) {
      throw new NotFoundError('Participation not found');
    }
    if (participation.approvalStatus !== ApprovalStatus.PENDING) {
      throw new ConflictError('Participation is not pending');
    }

    const updated = await prisma.employeeParticipation.update({
      where: { employeeParticipationId: id },
      data: {
        approvalStatus: ApprovalStatus.REJECTED,
        approvedBy: approverId,
        approvedAt: new Date()
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
          eventType: NotificationEventType.CSR_APPROVAL_DECISION,
          title: 'CSR Participation Rejected',
          message: `Your participation in ${participation.csrActivity.title} was rejected.`,
          relatedEntityType: 'EMPLOYEE_PARTICIPATION',
          relatedEntityId: id
        }
      });
    }

    return updated;
  }
};
