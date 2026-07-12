import { Request, Response, NextFunction } from 'express';
import { policiesService } from './policies.service.js';

export const policiesController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await policiesService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await policiesService.list(req.user!.organizationId, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await policiesService.getById(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await policiesService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await policiesService.delete(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  },

  async getAcknowledgements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await policiesService.getAcknowledgements(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await policiesService.acknowledge(req.user!.organizationId, req.user!.employeeId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async remind(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await policiesService.remind(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
};
