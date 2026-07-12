import { NextFunction, Request, Response } from 'express';
import { settingsService } from './settings.service.js';

export const settingsController = {
  async getConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await settingsService.getConfiguration(req.user!.organizationId);
      res.json({ data: config });
    } catch (err) {
      next(err);
    }
  },

  async updateConfiguration(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await settingsService.updateConfiguration(req.user!.organizationId, req.body);
      res.json({ data: config });
    } catch (err) {
      next(err);
    }
  },
};
