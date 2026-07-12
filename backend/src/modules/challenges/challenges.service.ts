import prisma from '../../config/db.js';
import { NotFoundError, ConflictError, ValidationError } from '../../shared/utils/errors.js';
import { LifecycleStatus } from '../../generated/prisma/index.js';

export const challengesService = {
  async create(organizationId: string, data: any) {
    return prisma.challenge.create({
      data: {
        ...data,
        organizationId,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: LifecycleStatus.DRAFT,
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { categoryId, status, difficulty, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = { organizationId };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (difficulty) where.difficulty = difficulty;

    const [data, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.challenge.count({ where })
    ]);

    return { data, meta: { page: Number(page), limit: Number(limit), total } };
  },

  async getById(organizationId: string, id: string) {
    const challenge = await prisma.challenge.findFirst({
      where: { challengeId: id, organizationId },
      include: { category: true }
    });
    if (!challenge) throw new NotFoundError('Challenge not found');
    return challenge;
  },

  async update(organizationId: string, id: string, data: any) {
    const challenge = await prisma.challenge.findFirst({
      where: { challengeId: id, organizationId }
    });
    if (!challenge) throw new NotFoundError('Challenge not found');

    const updateData = { ...data };
    if (data.deadline !== undefined) {
      updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    }

    if (data.status && data.status !== challenge.status) {
      this.validateStatusTransition(challenge.status, data.status);
    }

    return prisma.challenge.update({
      where: { challengeId: id },
      data: updateData
    });
  },
  
  async updateStatus(organizationId: string, id: string, status: string) {
    const challenge = await prisma.challenge.findFirst({
      where: { challengeId: id, organizationId }
    });
    if (!challenge) throw new NotFoundError('Challenge not found');

    this.validateStatusTransition(challenge.status, status);

    return prisma.challenge.update({
      where: { challengeId: id },
      data: { status: status as LifecycleStatus }
    });
  },

  validateStatusTransition(currentStatus: string, newStatus: string) {
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ['ACTIVE', 'ARCHIVED'],
      ACTIVE: ['UNDER_REVIEW', 'ARCHIVED'],
      UNDER_REVIEW: ['COMPLETED', 'ARCHIVED'],
      COMPLETED: ['ARCHIVED'],
      ARCHIVED: []
    };

    const allowed = allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new ValidationError(`Cannot transition status from ${currentStatus} to ${newStatus}`);
    }
  },

  async delete(organizationId: string, id: string) {
    const challenge = await prisma.challenge.findFirst({
      where: { challengeId: id, organizationId }
    });
    if (!challenge) throw new NotFoundError('Challenge not found');
    
    if (challenge.status !== LifecycleStatus.DRAFT) {
      throw new ConflictError('Only DRAFT challenges can be deleted');
    }

    return prisma.challenge.delete({
      where: { challengeId: id }
    });
  },

  async getParticipants(organizationId: string, id: string) {
    const challenge = await prisma.challenge.findFirst({
      where: { challengeId: id, organizationId }
    });
    if (!challenge) throw new NotFoundError('Challenge not found');

    return prisma.challengeParticipation.findMany({
      where: { challengeId: id },
      include: { employee: true }
    });
  }
};
