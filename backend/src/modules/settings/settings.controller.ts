import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service.js';

export const settingsController = {
  async getConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = req.user!;
      const result = await settingsService.getConfig(organizationId);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async updateConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organizationId } = req.user!;
      const result = await settingsService.updateConfig(organizationId, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
