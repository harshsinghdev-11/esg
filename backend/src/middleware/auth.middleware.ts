import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { UnauthorizedError } from '../shared/utils/errors.js';
import { EmployeeRole } from '../generated/prisma/index.js';

interface JwtPayload {
  employeeId: string;
  organizationId: string;
  role: EmployeeRole;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new UnauthorizedError('Missing token'));
  }
  try {
    const secretKey = process.env.JWT_ACCESS_SECRET || 'secret';
    const decoded = jwt.verify(token, secretKey) as any;
    req.user = decoded as JwtPayload;
    next();
  } catch (err) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

export { rbac } from './rbac.middleware.js';
