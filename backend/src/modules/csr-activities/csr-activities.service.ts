import prisma from '../../config/db.js';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/utils/errors.js';
import { LifecycleStatus } from '../../generated/prisma/index.js';

export const csrActivitiesService = {
  async create(organizationId: string, data: any) {
    return prisma.csrActivity.create({
      data: {
        ...data,
        organizationId,
        activityDate: new Date(data.activityDate),
        status: LifecycleStatus.DRAFT,
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { categoryId, departmentId, status, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { organizationId };
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.csrActivity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: true, department: true }
      }),
      prisma.csrActivity.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getById(organizationId: string, id: string) {
    const activity = await prisma.csrActivity.findFirst({
      where: { csrActivityId: id, organizationId },
      include: { category: true, department: true }
    });
    if (!activity) throw new NotFoundError('CSR Activity not found');
    return activity;
  },

  async update(organizationId: string, id: string, data: any) {
    const activity = await prisma.csrActivity.findFirst({
      where: { csrActivityId: id, organizationId }
    });
    if (!activity) throw new NotFoundError('CSR Activity not found');

    const updateData = { ...data };
    if (data.activityDate) updateData.activityDate = new Date(data.activityDate);

    if (data.status && data.status !== activity.status) {
      const allowedTransitions: Record<string, string[]> = {
        DRAFT: ['ACTIVE', 'ARCHIVED'],
        ACTIVE: ['UNDER_REVIEW', 'ARCHIVED'],
        UNDER_REVIEW: ['COMPLETED', 'ARCHIVED'],
        COMPLETED: ['ARCHIVED'],
        ARCHIVED: []
      };

      const allowed = allowedTransitions[activity.status];
      if (!allowed || !allowed.includes(data.status)) {
        throw new ValidationError(`Cannot transition status from ${activity.status} to ${data.status}`);
      }
    }

    return prisma.csrActivity.update({
      where: { csrActivityId: id },
      data: updateData
    });
  },

  async delete(organizationId: string, id: string) {
    const activity = await prisma.csrActivity.findFirst({
      where: { csrActivityId: id, organizationId }
    });
    if (!activity) throw new NotFoundError('CSR Activity not found');

    return prisma.csrActivity.update({
      where: { csrActivityId: id },
      data: { status: LifecycleStatus.ARCHIVED }
    });
  },

  async getParticipants(organizationId: string, id: string) {
    const activity = await prisma.csrActivity.findFirst({
      where: { csrActivityId: id, organizationId }
    });
    if (!activity) throw new NotFoundError('CSR Activity not found');

    return prisma.employeeParticipation.findMany({
      where: { csrActivityId: id },
      include: { employee: true }
    });
  }
};
