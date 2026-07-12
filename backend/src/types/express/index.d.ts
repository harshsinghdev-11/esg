import { EmployeeRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        employeeId: string;
        organizationId: string;
        role: EmployeeRole;
      };
    }
  }
}
