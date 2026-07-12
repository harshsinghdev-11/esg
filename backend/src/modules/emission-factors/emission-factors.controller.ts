import { Request, Response, NextFunction } from 'express';
import { emissionFactorsService } from './emission-factors.service.js';

export const emissionFactorsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emissionFactorsService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emissionFactorsService.list(req.user!.organizationId, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emissionFactorsService.getById(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emissionFactorsService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await emissionFactorsService.delete(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
};
