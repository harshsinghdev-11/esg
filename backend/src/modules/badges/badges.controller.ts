import { Request, Response, NextFunction } from 'express';
import { badgesService } from './badges.service.js';

export const badgesController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await badgesService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await badgesService.list(req.user!.organizationId, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await badgesService.getById(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await badgesService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await badgesService.delete(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  },

  async getHolders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await badgesService.getHolders(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
