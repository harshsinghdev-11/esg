import { NextFunction, Request, Response } from 'express';
import { scoresService } from './scores.service.js';

export const scoresController = {
  async listDepartmentScores(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await scoresService.listDepartmentScores(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentScore(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await scoresService.getDepartmentScore(req.user!.organizationId, req.params.id as string);
      res.json({ data: score });
    } catch (err) {
      next(err);
    }
  },

  async recalculateDepartmentScore(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await scoresService.recalculateDepartment(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: score });
    } catch (err) {
      next(err);
    }
  },

  async getOrganizationScore(req: Request, res: Response, next: NextFunction) {
    try {
      const score = await scoresService.getOrganizationScore(req.user!.organizationId);
      res.json({ data: score });
    } catch (err) {
      next(err);
    }
  },
};
