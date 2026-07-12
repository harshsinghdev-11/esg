import prisma from '../../config/db.js';
import { NotFoundError } from '../../shared/utils/errors.js';
import { GoalStatus } from '../../generated/prisma/index.js';

export const environmentalGoalsService = {
  async create(organizationId: string, data: any) {
    return prisma.environmentalGoal.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        targetDate: new Date(data.targetDate),
        organizationId,
        status: GoalStatus.NOT_STARTED
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { department_id, status } = query;
    return prisma.environmentalGoal.findMany({
      where: {
        organizationId,
        ...(department_id ? { departmentId: department_id } : {}),
        ...(status ? { status: status as GoalStatus } : {})
      }
    });
  },

  async getById(organizationId: string, id: string) {
    const goal = await prisma.environmentalGoal.findFirst({
      where: { environmentalGoalId: id, organizationId }
    });
    if (!goal) throw new NotFoundError('Environmental goal not found');
    return goal;
  },

  async update(organizationId: string, id: string, data: any) {
    const goal = await prisma.environmentalGoal.findFirst({
      where: { environmentalGoalId: id, organizationId }
    });
    if (!goal) throw new NotFoundError('Environmental goal not found');

    const updateData: any = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

    return prisma.environmentalGoal.update({
      where: { environmentalGoalId: id },
      data: updateData
    });
  },

  async delete(organizationId: string, id: string) {
    const goal = await prisma.environmentalGoal.findFirst({
      where: { environmentalGoalId: id, organizationId }
    });
    if (!goal) throw new NotFoundError('Environmental goal not found');

    // DB schema doesn't have a deleted status, we can actually delete it or set status to MISSED. Let's delete it.
    return prisma.environmentalGoal.delete({
      where: { environmentalGoalId: id }
    });
  }
};
