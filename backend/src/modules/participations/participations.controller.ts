import { Request, Response, NextFunction } from 'express';
import { participationsService } from './participations.service.js';

export const participationsController = {
  async participate(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await participationsService.participate(req.user!.organizationId, req.user!.employeeId, req.params.id as string, req.body);
      res.status(201).json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await participationsService.list(req.user!.organizationId, req.query, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await participationsService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async updateProof(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await participationsService.updateProof(
        req.user!.organizationId,
        req.params.id as string,
        req.user!.employeeId,
        req.body,
      );
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await participationsService.approve(req.user!.organizationId, req.params.id as string, req.user!.employeeId);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const participation = await participationsService.reject(req.user!.organizationId, req.params.id as string, req.user!.employeeId);
      res.json({ data: participation });
    } catch (err) {
      next(err);
    }
  }
};
