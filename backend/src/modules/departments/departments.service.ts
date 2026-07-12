import prisma from '../../config/db.js';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { DepartmentStatus } from '../../generated/prisma/index.js';

export const departmentsService = {
  async create(organizationId: string, data: any) {
    const existing = await prisma.department.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } }
    });
    if (existing) {
      throw new ConflictError('Department code already exists');
    }

    return prisma.department.create({
      data: {
        ...data,
        organizationId,
        status: DepartmentStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { parent_department_id } = query;
    return prisma.department.findMany({
      where: {
        organizationId,
        ...(parent_department_id ? { parentDepartmentId: parent_department_id } : {})
      },
      include: { headEmployee: true }
    });
  },

  async getById(organizationId: string, id: string) {
    const dept = await prisma.department.findFirst({
      where: { departmentId: id, organizationId },
      include: { headEmployee: true, parentDepartment: true }
    });
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  },

  async update(organizationId: string, id: string, data: any) {
    const dept = await prisma.department.findFirst({
      where: { departmentId: id, organizationId }
    });
    if (!dept) throw new NotFoundError('Department not found');

    if (data.code && data.code !== dept.code) {
      const existing = await prisma.department.findUnique({
        where: { organizationId_code: { organizationId, code: data.code } }
      });
      if (existing) throw new ConflictError('Department code already exists');
    }

    return prisma.department.update({
      where: { departmentId: id },
      data
    });
  },

  async delete(organizationId: string, id: string) {
    const dept = await prisma.department.findFirst({
      where: { departmentId: id, organizationId }
    });
    if (!dept) throw new NotFoundError('Department not found');

    return prisma.department.update({
      where: { departmentId: id },
      data: { status: DepartmentStatus.INACTIVE }
    });
  },

  async getHierarchy(organizationId: string, id: string) {
    // Basic single level sub-tree for now to fit complexity. Prisma doesn't do deep recursive easily without raw query.
    const dept = await prisma.department.findFirst({
      where: { departmentId: id, organizationId },
      include: { childDepartments: true }
    });
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  },

  async getEmployees(organizationId: string, id: string) {
    const dept = await prisma.department.findFirst({
      where: { departmentId: id, organizationId }
    });
    if (!dept) throw new NotFoundError('Department not found');

    return prisma.employee.findMany({
      where: { departmentId: id, organizationId }
    });
  }
};
