import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // @ts-ignore (because req.user is populated by authMiddleware)
      const { employeeId, organizationId } = req.user!;
      const result = await authService.getMe(employeeId, organizationId);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
