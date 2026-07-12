import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from './leaderboard.service.js';

export const leaderboardController = {
  async getEmployeeRankings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await leaderboardService.getEmployeeRankings(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentRankings(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await leaderboardService.getDepartmentRankings(req.user!.organizationId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};
