import { NextFunction, Request, Response } from 'express';
import { notificationsService } from './notifications.service.js';

export const notificationsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.list(
        req.user!.organizationId,
        req.user!.employeeId,
        req.query,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationsService.getById(
        req.user!.organizationId,
        req.user!.employeeId,
        req.params.id as string,
      );
      res.json({ data: notification });
    } catch (err) {
      next(err);
    }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationsService.markRead(
        req.user!.organizationId,
        req.user!.employeeId,
        req.params.id as string,
      );
      res.json({ data: notification });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationsService.markAllRead(
        req.user!.organizationId,
        req.user!.employeeId,
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};
