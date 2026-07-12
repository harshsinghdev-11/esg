import prisma from '../../config/db.js';
import { IssueSeverity, IssueStatus, NotificationEventType } from '../../generated/prisma/index.js';
import { NotFoundError, ValidationError } from '../../shared/utils/errors.js';

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

async function ensureOwnerBelongsToOrganization(organizationId: string, employeeId: string) {
  const owner = await prisma.employee.findFirst({
    where: {
      employeeId,
      organizationId,
    },
    select: {
      employeeId: true,
      fullName: true,
    },
  });

  if (!owner) {
    throw new NotFoundError('Owner employee not found');
  }

  return owner;
}

async function ensureAuditBelongsToOrganization(organizationId: string, auditId: string) {
  const audit = await prisma.audit.findFirst({
    where: {
      auditId,
      organizationId,
    },
    select: {
      auditId: true,
      title: true,
      organizationId: true,
      departmentId: true,
    },
  });

  if (!audit) {
    throw new NotFoundError('Audit not found');
  }

  return audit;
}

export const complianceIssuesService = {
  async create(organizationId: string, data: any) {
    if (!data.ownerEmployeeId || !data.dueDate) {
      throw new ValidationError('ownerEmployeeId and dueDate are required');
    }

    const [audit, owner, config] = await Promise.all([
      ensureAuditBelongsToOrganization(organizationId, data.auditId),
      ensureOwnerBelongsToOrganization(organizationId, data.ownerEmployeeId),
      prisma.esgConfiguration.findUnique({
        where: { organizationId },
      }),
    ]);

    const issue = await prisma.$transaction(async (tx) => {
      const createdIssue = await tx.complianceIssue.create({
        data: {
          auditId: audit.auditId,
          severity: data.severity as IssueSeverity,
          description: data.description,
          ownerEmployeeId: owner.employeeId,
          dueDate: new Date(data.dueDate),
          status: IssueStatus.OPEN,
        },
        include: {
          audit: true,
          owner: true,
        },
      });

      if (config?.notifyInApp) {
        await tx.notification.create({
          data: {
            organizationId,
            recipientEmployeeId: owner.employeeId,
            eventType: NotificationEventType.COMPLIANCE_ISSUE_RAISED,
            title: 'Compliance issue assigned',
            message: `A new compliance issue was assigned to you from audit "${audit.title}".`,
            relatedEntityType: 'COMPLIANCE_ISSUE',
            relatedEntityId: createdIssue.complianceIssueId,
          },
        });
      }

      return createdIssue;
    });

    if (config?.notifyEmail) {
      console.log(`[Notifications] Email stub: compliance issue ${issue.complianceIssueId} sent to ${owner.fullName}`);
    }

    return issue;
  },

  async list(organizationId: string, query: any) {
    const { status, severity, owner_employee_id, overdue, page = 1, limit = 20 } = query;
    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const skip = (currentPage - 1) * currentLimit;
    const overdueFilter = overdue === true || overdue === 'true';

    const where: any = {
      audit: {
        organizationId,
      },
      ...(status ? { status: status as IssueStatus } : {}),
      ...(severity ? { severity: severity as IssueSeverity } : {}),
      ...(owner_employee_id ? { ownerEmployeeId: owner_employee_id as string } : {}),
    };

    if (overdueFilter) {
      where.OR = [
        { status: IssueStatus.OVERDUE },
        {
          status: IssueStatus.OPEN,
          dueDate: { lt: startOfToday() },
        },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.complianceIssue.findMany({
        where,
        skip,
        take: currentLimit,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        include: {
          audit: {
            include: {
              department: true,
            },
          },
          owner: {
            select: {
              employeeId: true,
              fullName: true,
              email: true,
              employeeCode: true,
            },
          },
        },
      }),
      prisma.complianceIssue.count({ where }),
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

  async getById(organizationId: string, id: string) {
    const issue = await prisma.complianceIssue.findFirst({
      where: {
        complianceIssueId: id,
        audit: {
          organizationId,
        },
      },
      include: {
        audit: {
          include: {
            department: true,
          },
        },
        owner: {
          select: {
            employeeId: true,
            fullName: true,
            email: true,
            employeeCode: true,
            departmentId: true,
          },
        },
      },
    });

    if (!issue) {
      throw new NotFoundError('Compliance issue not found');
    }

    return issue;
  },

  async update(organizationId: string, id: string, data: any) {
    const existing = await prisma.complianceIssue.findFirst({
      where: {
        complianceIssueId: id,
        audit: {
          organizationId,
        },
      },
      include: {
        audit: true,
      },
    });

    if (!existing) {
      throw new NotFoundError('Compliance issue not found');
    }

    if (data.ownerEmployeeId) {
      await ensureOwnerBelongsToOrganization(organizationId, data.ownerEmployeeId);
    }

    const nextStatus = (data.status as IssueStatus | undefined) ?? existing.status;
    const resolvedDate =
      data.resolvedDate !== undefined
        ? parseDate(data.resolvedDate)
        : nextStatus === IssueStatus.RESOLVED || nextStatus === IssueStatus.CLOSED
          ? existing.resolvedDate ?? new Date()
          : existing.resolvedDate;

    return prisma.complianceIssue.update({
      where: {
        complianceIssueId: id,
      },
      data: {
        ...(data.severity !== undefined ? { severity: data.severity as IssueSeverity } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.ownerEmployeeId !== undefined ? { ownerEmployeeId: data.ownerEmployeeId } : {}),
        ...(data.dueDate !== undefined ? { dueDate: new Date(data.dueDate) } : {}),
        ...(data.status !== undefined ? { status: data.status as IssueStatus } : {}),
        resolvedDate,
      },
      include: {
        audit: true,
        owner: true,
      },
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await prisma.complianceIssue.findFirst({
      where: {
        complianceIssueId: id,
        audit: {
          organizationId,
        },
      },
      select: {
        complianceIssueId: true,
      },
    });

    if (!existing) {
      throw new NotFoundError('Compliance issue not found');
    }

    return prisma.complianceIssue.update({
      where: {
        complianceIssueId: id,
      },
      data: {
        status: IssueStatus.CLOSED,
        resolvedDate: new Date(),
      },
      include: {
        audit: true,
        owner: true,
      },
    });
  },

  async getOverdue(organizationId: string) {
    const today = startOfToday();

    return prisma.complianceIssue.findMany({
      where: {
        audit: {
          organizationId,
        },
        OR: [
          { status: IssueStatus.OVERDUE },
          {
            status: IssueStatus.OPEN,
            dueDate: { lt: today },
          },
        ],
      },
      include: {
        audit: true,
        owner: {
          select: {
            employeeId: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  },
};
