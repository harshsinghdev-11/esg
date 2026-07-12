import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import prisma from '../../config/db.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/utils/errors.js';
import { EmployeeRole, RecordStatus } from '../../generated/prisma/index.js';

export const authService = {
  async register(data: { organizationName: string; adminName: string; adminEmail: string; adminPassword: string }) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingEmployee) {
      throw new ConflictError('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          status: RecordStatus.ACTIVE,
        },
      });

      const employee = await tx.employee.create({
        data: {
          organizationId: organization.organizationId,
          email: data.adminEmail,
          fullName: data.adminName,
          employeeCode: 'ADMIN-001',
          role: EmployeeRole.SUPER_ADMIN,
          passwordHash,
        },
      });

      await tx.esgConfiguration.create({
        data: {
          organizationId: organization.organizationId,
        }
      });

      return { organization, employee };
    });

    const token = jwt.sign(
      {
        employeeId: result.employee.employeeId,
        organizationId: result.organization.organizationId,
        role: result.employee.role,
      },
      process.env.JWT_ACCESS_SECRET ? String(process.env.JWT_ACCESS_SECRET) : 'secret',
      { expiresIn: '1d' }
    );

    return { token, employee: result.employee };
  },

  async login(data: { email: string; password: string }) {
    const employee = await prisma.employee.findUnique({
      where: { email: data.email },
    });

    if (!employee || !employee.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, employee.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (employee.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is not active');
    }

    const token = jwt.sign(
      {
        employeeId: employee.employeeId,
        organizationId: employee.organizationId,
        role: employee.role,
      },
      process.env.JWT_ACCESS_SECRET ? String(process.env.JWT_ACCESS_SECRET) : 'secret',
      { expiresIn: '1d' }
    );

    return { token, employee };
  },

  async getMe(employeeId: string, organizationId: string) {
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      include: { department: true, organization: true }
    });

    if (!employee || employee.organizationId !== organizationId) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }
};
