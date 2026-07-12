import prisma from '../config/db.js';
import { IssueStatus, NotificationEventType } from '../generated/prisma/index.js';

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function summarizeDescription(description: string) {
  return description.length > 60 ? `${description.slice(0, 57)}...` : description;
}

export async function runOverdueIssueFlag(targetOrganizationId?: string) {
  let flaggedCount = 0;
  let notifiedCount = 0;
  let errorsCount = 0;

  try {
    const issues = await prisma.complianceIssue.findMany({
      where: {
        status: IssueStatus.OPEN,
        dueDate: {
          lt: startOfToday(),
        },
        ...(targetOrganizationId
          ? {
              audit: {
                organizationId: targetOrganizationId,
              },
            }
          : {}),
      },
      include: {
        audit: true,
        owner: true,
      },
    });

    for (const issue of issues) {
      try {
        const config = await prisma.esgConfiguration.findUnique({
          where: { organizationId: issue.audit.organizationId },
        });

        await prisma.$transaction(async (tx) => {
          await tx.complianceIssue.update({
            where: {
              complianceIssueId: issue.complianceIssueId,
            },
            data: {
              status: IssueStatus.OVERDUE,
            },
          });

          if (config?.notifyInApp) {
            await tx.notification.create({
              data: {
                organizationId: issue.audit.organizationId,
                recipientEmployeeId: issue.ownerEmployeeId,
                eventType: NotificationEventType.ISSUE_OVERDUE,
                title: 'Compliance issue overdue',
                message: `Issue overdue: ${summarizeDescription(issue.description)}`,
                relatedEntityType: 'COMPLIANCE_ISSUE',
                relatedEntityId: issue.complianceIssueId,
              },
            });
            notifiedCount += 1;
          }
        });

        if (config?.notifyEmail) {
          console.log(`[Notifications] Email stub: overdue issue ${issue.complianceIssueId} sent to ${issue.owner.email}`);
        }

        flaggedCount += 1;
      } catch (err) {
        console.error(`[Job: OverdueIssueFlag] Failed to flag issue ${issue.complianceIssueId}:`, err);
        errorsCount += 1;
      }
    }
  } catch (err) {
    console.error('[Job: OverdueIssueFlag] Critical failure:', err);
    errorsCount += 1;
  }

  return {
    flaggedCount,
    notifiedCount,
    errorsCount,
  };
}
