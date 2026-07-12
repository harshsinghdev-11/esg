import prisma from '../../config/db.js';
import { AuditStatus } from '../../generated/prisma/index.js';
import { NotFoundError } from '../../shared/utils/errors.js';

function parseOptionalDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value);
}

async function ensureDepartmentBelongsToOrganization(organizationId: string, departmentId?: string | null) {
  if (!departmentId) {
    return;
  }

  const department = await prisma.department.findFirst({
    where: {
      departmentId,
      organizationId,
    },
    select: { departmentId: true },
  });

  if (!department) {
    throw new NotFoundError('Department not found');
  }
}

export const auditsService = {
  async create(organizationId: string, data: any) {
    await ensureDepartmentBelongsToOrganization(organizationId, data.departmentId);

    return prisma.audit.create({
      data: {
        organizationId,
        title: data.title,
        auditType: data.auditType ?? null,
        departmentId: data.departmentId ?? null,
        scheduledDate: parseOptionalDate(data.scheduledDate),
        completedDate: parseOptionalDate(data.completedDate),
        status: (data.status as AuditStatus | undefined) ?? AuditStatus.SCHEDULED,
        findingsSummary: data.findingsSummary ?? null,
      },
      include: {
        department: true,
      },
    });
  },

  async list(organizationId: string, query: any) {
    const { department_id, status, page = 1, limit = 20 } = query;
    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const skip = (currentPage - 1) * currentLimit;

    const where = {
      organizationId,
      ...(department_id ? { departmentId: department_id as string } : {}),
      ...(status ? { status: status as AuditStatus } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        skip,
        take: currentLimit,
        orderBy: [{ scheduledDate: 'desc' }, { title: 'asc' }],
        include: {
          department: true,
          _count: {
            select: { complianceIssues: true },
          },
        },
      }),
      prisma.audit.count({ where }),
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
    const audit = await prisma.audit.findFirst({
      where: {
        auditId: id,
        organizationId,
      },
      include: {
        department: true,
        complianceIssues: {
          include: {
            owner: {
              select: {
                employeeId: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!audit) {
      throw new NotFoundError('Audit not found');
    }

    return audit;
  },

  async update(organizationId: string, id: string, data: any) {
    const existing = await prisma.audit.findFirst({
      where: {
        auditId: id,
        organizationId,
      },
      select: { auditId: true },
    });

    if (!existing) {
      throw new NotFoundError('Audit not found');
    }

    await ensureDepartmentBelongsToOrganization(organizationId, data.departmentId);

    return prisma.audit.update({
      where: { auditId: id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.auditType !== undefined ? { auditType: data.auditType } : {}),
        ...(data.departmentId !== undefined ? { departmentId: data.departmentId } : {}),
        ...(data.scheduledDate !== undefined ? { scheduledDate: parseOptionalDate(data.scheduledDate) } : {}),
        ...(data.completedDate !== undefined ? { completedDate: parseOptionalDate(data.completedDate) } : {}),
        ...(data.status !== undefined ? { status: data.status as AuditStatus } : {}),
        ...(data.findingsSummary !== undefined ? { findingsSummary: data.findingsSummary } : {}),
      },
      include: {
        department: true,
      },
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await prisma.audit.findFirst({
      where: {
        auditId: id,
        organizationId,
      },
      select: { auditId: true },
    });

    if (!existing) {
      throw new NotFoundError('Audit not found');
    }

    return prisma.audit.update({
      where: { auditId: id },
      data: {
        status: AuditStatus.CANCELLED,
      },
    });
  },

  async getIssues(organizationId: string, id: string) {
    const audit = await prisma.audit.findFirst({
      where: {
        auditId: id,
        organizationId,
      },
      select: { auditId: true },
    });

    if (!audit) {
      throw new NotFoundError('Audit not found');
    }

    return prisma.complianceIssue.findMany({
      where: {
        auditId: id,
      },
      include: {
        owner: {
          select: {
            employeeId: true,
            fullName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  },
};
