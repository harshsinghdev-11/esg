import { Request, Response, NextFunction } from 'express';
import { rewardsService } from './rewards.service.js';

export const rewardsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.list(req.user!.organizationId, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.getById(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await rewardsService.delete(req.user!.organizationId, req.params.id as string);
      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  },

  async redeem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.redeem(req.user!.organizationId, req.user!.employeeId, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async listRedemptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.listRedemptions(req.user!.organizationId, req.user!.employeeId, req.user!.role, req.query);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getRedemptionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.getRedemptionById(req.user!.organizationId, req.user!.employeeId, req.user!.role, req.params.id as string);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async updateRedemption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await rewardsService.updateRedemption(req.user!.organizationId, req.params.id as string, req.body.status);
      res.status(200).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
