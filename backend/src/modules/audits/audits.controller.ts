import { NextFunction, Request, Response } from 'express';
import { auditsService } from './audits.service.js';

export const auditsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const audit = await auditsService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: audit });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await auditsService.list(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const audit = await auditsService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: audit });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const audit = await auditsService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: audit });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const audit = await auditsService.delete(req.user!.organizationId, req.params.id as string);
      res.json({ data: audit });
    } catch (err) {
      next(err);
    }
  },

  async getIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const issues = await auditsService.getIssues(req.user!.organizationId, req.params.id as string);
      res.json({ data: issues });
    } catch (err) {
      next(err);
    }
  },
};
