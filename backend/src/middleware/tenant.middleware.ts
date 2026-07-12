import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../shared/utils/errors.js';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.organizationId) {
    return next(new UnauthorizedError('Organization context is missing'));
  }
  next();
};
