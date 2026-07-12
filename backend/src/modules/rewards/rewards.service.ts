import prisma from '../../config/db.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { RecordStatus, RedemptionStatus, EmployeeRole } from '../../generated/prisma/index.js';

export const rewardsService = {
  async create(organizationId: string, data: any) {
    return prisma.reward.create({
      data: {
        ...data,
        organizationId,
        status: RecordStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { status } = query;
    return prisma.reward.findMany({
      where: {
        organizationId,
        ...(status ? { status: status as RecordStatus } : {})
      }
    });
  },

  async getById(organizationId: string, id: string) {
    const reward = await prisma.reward.findFirst({
      where: { rewardId: id, organizationId }
    });
    if (!reward) throw new NotFoundError('Reward not found');
    return reward;
  },

  async update(organizationId: string, id: string, data: any) {
    const reward = await prisma.reward.findFirst({
      where: { rewardId: id, organizationId }
    });
    if (!reward) throw new NotFoundError('Reward not found');

    return prisma.reward.update({
      where: { rewardId: id },
      data
    });
  },

  async delete(organizationId: string, id: string) {
    const reward = await prisma.reward.findFirst({
      where: { rewardId: id, organizationId }
    });
    if (!reward) throw new NotFoundError('Reward not found');

    return prisma.reward.update({
      where: { rewardId: id },
      data: { status: RecordStatus.INACTIVE }
    });
  },

  async redeem(organizationId: string, employeeId: string, rewardId: string) {
    const reward = await prisma.reward.findFirst({
      where: { rewardId, organizationId }
    });
    if (!reward) throw new NotFoundError('Reward not found');
    if (reward.status !== RecordStatus.ACTIVE) throw new ConflictError('Reward unavailable');
    if (reward.stock <= 0) throw new ConflictError('Out of stock');

    const employee = await prisma.employee.findUnique({ where: { employeeId } });
    if (!employee) throw new NotFoundError('Employee not found');
    if (employee.totalPointsBalance < reward.pointsRequired) throw new ConflictError('Insufficient points balance');

    return prisma.$transaction(async (tx) => {
      // Deduct points
      await tx.employee.update({
        where: { employeeId },
        data: { totalPointsBalance: { decrement: reward.pointsRequired } }
      });

      // Deduct stock
      await tx.reward.update({
        where: { rewardId },
        data: { stock: { decrement: 1 } }
      });

      // Create redemption
      const redemption = await tx.rewardRedemption.create({
        data: {
          employeeId,
          rewardId,
          pointsSpent: reward.pointsRequired,
          status: RedemptionStatus.PENDING
        }
      });

      return redemption;
    });
  },

  async listRedemptions(organizationId: string, employeeId: string, role: EmployeeRole, query: any) {
    const { status } = query;
    const isAdmin = role === EmployeeRole.SUPER_ADMIN || role === EmployeeRole.ESG_MANAGER;
    
    return prisma.rewardRedemption.findMany({
      where: {
        reward: { organizationId },
        ...(!isAdmin ? { employeeId } : {}),
        ...(status ? { status: status as RedemptionStatus } : {})
      },
      include: {
        reward: true,
        employee: { select: { fullName: true, employeeCode: true } }
      }
    });
  },

  async getRedemptionById(organizationId: string, employeeId: string, role: EmployeeRole, id: string) {
    const isAdmin = role === EmployeeRole.SUPER_ADMIN || role === EmployeeRole.ESG_MANAGER;
    
    const redemption = await prisma.rewardRedemption.findFirst({
      where: {
        rewardRedemptionId: id,
        reward: { organizationId },
        ...(!isAdmin ? { employeeId } : {})
      },
      include: {
        reward: true,
        employee: { select: { fullName: true, employeeCode: true } }
      }
    });

    if (!redemption) throw new NotFoundError('Redemption not found');
    return redemption;
  },

  async updateRedemption(organizationId: string, id: string, status: RedemptionStatus) {
    const redemption = await prisma.rewardRedemption.findFirst({
      where: { rewardRedemptionId: id, reward: { organizationId } }
    });
    if (!redemption) throw new NotFoundError('Redemption not found');

    return prisma.rewardRedemption.update({
      where: { rewardRedemptionId: id },
      data: { status }
    });
  }
};
