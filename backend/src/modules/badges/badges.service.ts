import prisma from '../../config/db.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { RecordStatus } from '../../generated/prisma/index.js';

export const badgesService = {
  async create(organizationId: string, data: any) {
    return prisma.badge.create({
      data: {
        ...data,
        organizationId,
        status: RecordStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { status } = query;
    return prisma.badge.findMany({
      where: {
        organizationId,
        ...(status ? { status: status as RecordStatus } : {})
      }
    });
  },

  async getById(organizationId: string, id: string) {
    const badge = await prisma.badge.findFirst({
      where: { badgeId: id, organizationId }
    });
    if (!badge) throw new NotFoundError('Badge not found');
    return badge;
  },

  async update(organizationId: string, id: string, data: any) {
    const badge = await prisma.badge.findFirst({
      where: { badgeId: id, organizationId }
    });
    if (!badge) throw new NotFoundError('Badge not found');

    return prisma.badge.update({
      where: { badgeId: id },
      data
    });
  },

  async delete(organizationId: string, id: string) {
    const badge = await prisma.badge.findFirst({
      where: { badgeId: id, organizationId }
    });
    if (!badge) throw new NotFoundError('Badge not found');

    return prisma.badge.update({
      where: { badgeId: id },
      data: { status: RecordStatus.INACTIVE }
    });
  },

  async getHolders(organizationId: string, id: string) {
    const badge = await prisma.badge.findFirst({
      where: { badgeId: id, organizationId }
    });
    if (!badge) throw new NotFoundError('Badge not found');

    const holders = await prisma.employeeBadge.findMany({
      where: { badgeId: id },
      include: { employee: true }
    });

    return holders.map(h => h.employee);
  }
};
