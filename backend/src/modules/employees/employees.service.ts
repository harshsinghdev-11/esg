import prisma from '../../config/db.js';
import bcrypt from 'bcrypt';
import { NotFoundError, ConflictError } from '../../shared/utils/errors.js';
import { EmployeeStatus } from '../../generated/prisma/index.js';

export const employeesService = {
  async create(organizationId: string, data: any) {
    const existing = await prisma.employee.findUnique({
      where: { organizationId_employeeCode: { organizationId, employeeCode: data.employeeCode } }
    });
    if (existing) {
      throw new ConflictError('Employee code already exists');
    }

    const existingEmail = await prisma.employee.findUnique({
      where: { email: data.email }
    });
    if (existingEmail) {
      throw new ConflictError('Email is already in use');
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    return prisma.employee.create({
      data: {
        ...data,
        organizationId,
        passwordHash,
        status: EmployeeStatus.ACTIVE
      }
    });
  },

  async list(organizationId: string, query: any) {
    const { department_id, status, role } = query;
    return prisma.employee.findMany({
      where: {
        organizationId,
        ...(department_id ? { departmentId: department_id } : {}),
        ...(status ? { status } : {}),
        ...(role ? { role } : {})
      },
      include: { department: true }
    });
  },

  async getById(organizationId: string, id: string) {
    const emp = await prisma.employee.findFirst({
      where: { employeeId: id, organizationId },
      include: { department: true }
    });
    if (!emp) throw new NotFoundError('Employee not found');
    return emp;
  },

  async update(organizationId: string, id: string, data: any) {
    const emp = await prisma.employee.findFirst({
      where: { employeeId: id, organizationId }
    });
    if (!emp) throw new NotFoundError('Employee not found');

    return prisma.employee.update({
      where: { employeeId: id },
      data
    });
  },

  async delete(organizationId: string, id: string) {
    const emp = await prisma.employee.findFirst({
      where: { employeeId: id, organizationId }
    });
    if (!emp) throw new NotFoundError('Employee not found');

    return prisma.employee.update({
      where: { employeeId: id },
      data: { status: EmployeeStatus.INACTIVE }
    });
  },

  async getXpHistory(organizationId: string, id: string) {
    const emp = await prisma.employee.findFirst({
      where: { employeeId: id, organizationId }
    });
    if (!emp) throw new NotFoundError('Employee not found');

    const csrParticipations = await prisma.employeeParticipation.findMany({
      where: { employeeId: id },
      include: { csrActivity: true }
    });

    const challengeParticipations = await prisma.challengeParticipation.findMany({
      where: { employeeId: id },
      include: { challenge: true }
    });

    return { csrParticipations, challengeParticipations };
  },

  async getBadges(organizationId: string, id: string) {
    return prisma.employeeBadge.findMany({
      where: { employeeId: id, employee: { organizationId } },
      include: { badge: true }
    });
  },

  async getParticipations(organizationId: string, id: string) {
    const csrParticipations = await prisma.employeeParticipation.findMany({
      where: { employeeId: id, employee: { organizationId } },
      include: { csrActivity: true }
    });

    const challengeParticipations = await prisma.challengeParticipation.findMany({
      where: { employeeId: id, employee: { organizationId } },
      include: { challenge: true }
    });

    return { csrParticipations, challengeParticipations };
  },

  async getNotifications(organizationId: string, id: string) {
    return prisma.notification.findMany({
      where: { recipientEmployeeId: id, organizationId },
      orderBy: { sentAt: 'desc' }
    });
  }
};
