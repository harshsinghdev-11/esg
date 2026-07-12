import { Request, Response, NextFunction } from 'express';
import { challengeParticipationsService } from './challenge-participations.service.js';

export const challengeParticipationsController = {
  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await challengeParticipationsService.join(req.user!.organizationId, req.user!.employeeId, req.params.id as string, req.body);
      res.status(201).json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await challengeParticipationsService.updateProgress(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await challengeParticipationsService.list(req.user!.organizationId, req.query, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await challengeParticipationsService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await challengeParticipationsService.approve(req.user!.organizationId, req.params.id as string, req.user!.employeeId);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await challengeParticipationsService.reject(req.user!.organizationId, req.params.id as string, req.user!.employeeId);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  }
};
