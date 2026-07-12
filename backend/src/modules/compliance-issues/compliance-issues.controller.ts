import { NextFunction, Request, Response } from 'express';
import { complianceIssuesService } from './compliance-issues.service.js';

export const complianceIssuesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await complianceIssuesService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: issue });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await complianceIssuesService.list(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await complianceIssuesService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: issue });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await complianceIssuesService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: issue });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const issue = await complianceIssuesService.delete(req.user!.organizationId, req.params.id as string);
      res.json({ data: issue });
    } catch (err) {
      next(err);
    }
  },

  async getOverdue(req: Request, res: Response, next: NextFunction) {
    try {
      const issues = await complianceIssuesService.getOverdue(req.user!.organizationId);
      res.json({ data: issues });
    } catch (err) {
      next(err);
    }
  },
};
