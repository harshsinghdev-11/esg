import prisma from '../../config/db.js';
import { NotFoundError } from '../../shared/utils/errors.js';

export const notificationsService = {
  async list(organizationId: string, employeeId: string, query: any) {
    const { is_read, page = 1, limit = 20 } = query;
    const currentPage = Number(page);
    const currentLimit = Number(limit);
    const skip = (currentPage - 1) * currentLimit;

    const where = {
      organizationId,
      recipientEmployeeId: employeeId,
      ...(is_read !== undefined ? { isRead: is_read === 'true' || is_read === true } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: currentLimit,
        orderBy: {
          sentAt: 'desc',
        },
      }),
      prisma.notification.count({ where }),
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

  async getById(organizationId: string, employeeId: string, id: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        notificationId: id,
        organizationId,
        recipientEmployeeId: employeeId,
      },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  },

  async markRead(organizationId: string, employeeId: string, id: string) {
    await this.getById(organizationId, employeeId, id);

    return prisma.notification.update({
      where: {
        notificationId: id,
      },
      data: {
        isRead: true,
      },
    });
  },

  async markAllRead(organizationId: string, employeeId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        organizationId,
        recipientEmployeeId: employeeId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      updatedCount: result.count,
    };
  },
};
