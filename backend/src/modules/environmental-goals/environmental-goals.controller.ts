import type { Request, Response, NextFunction } from 'express';
import { environmentalGoalsService } from './environmental-goals.service.js';

export const environmentalGoalsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await environmentalGoalsService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await environmentalGoalsService.list(req.user!.organizationId, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await environmentalGoalsService.getById(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await environmentalGoalsService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await environmentalGoalsService.delete(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
};
