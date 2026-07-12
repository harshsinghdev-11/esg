import { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service.js';
import { CategoryType } from '../../generated/prisma/index.js';

export const categoriesController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoriesService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoriesService.list(req.user!.organizationId, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoriesService.getById(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await categoriesService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await categoriesService.delete(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
};
