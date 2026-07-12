import { NextFunction, Request, Response } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getEnvironmental(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getEnvironmentalSummary(req.user!.organizationId, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getSocial(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getSocialSummary(req.user!.organizationId, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getGovernance(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getGovernanceSummary(req.user!.organizationId, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getGamification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getGamificationSummary(req.user!.organizationId, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview(req.user!.organizationId, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
};
