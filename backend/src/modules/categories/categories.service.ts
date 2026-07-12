import prisma from '../../config/db.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { RecordStatus, CategoryType } from '../../generated/prisma/index.js';

export const categoriesService = {
  async create(organizationId: string, data: { name: string; type: CategoryType }) {
    const existing = await prisma.category.findUnique({
      where: { organizationId_name_type: { organizationId, name: data.name, type: data.type } }
    });
    if (existing) {
      throw new ConflictError('Category with this name and type already exists');
    }

    return prisma.category.create({
      data: {
        ...data,
        organizationId,
        status: RecordStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { type } = query;
    return prisma.category.findMany({
      where: {
        organizationId,
        ...(type ? { type: type as CategoryType } : {})
      }
    });
  },

  async getById(organizationId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { categoryId: id, organizationId }
    });
    if (!category) throw new NotFoundError('Category not found');
    return category;
  },

  async update(organizationId: string, id: string, data: { name?: string; status?: RecordStatus }) {
    const category = await prisma.category.findFirst({
      where: { categoryId: id, organizationId }
    });
    if (!category) throw new NotFoundError('Category not found');

    if (data.name && data.name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { organizationId_name_type: { organizationId, name: data.name, type: category.type } }
      });
      if (existing) throw new ConflictError('Category with this name and type already exists');
    }

    return prisma.category.update({
      where: { categoryId: id },
      data
    });
  },

  async delete(organizationId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { categoryId: id, organizationId }
    });
    if (!category) throw new NotFoundError('Category not found');

    return prisma.category.update({
      where: { categoryId: id },
      data: { status: RecordStatus.ARCHIVED }
    });
  }
};
