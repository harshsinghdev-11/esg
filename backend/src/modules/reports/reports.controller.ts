import { NextFunction, Request, Response } from 'express';
import { reportsService } from './reports.service.js';

export const reportsController = {
  async getEnvironmental(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getEnvironmentalReport(req.user!.organizationId, req.query);
      res.json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async getSocial(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getSocialReport(req.user!.organizationId, req.query);
      res.json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async getGovernance(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getGovernanceReport(req.user!.organizationId, req.query);
      res.json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async getEsgSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.getEsgSummaryReport(req.user!.organizationId, req.query);
      res.json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async createCustom(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportsService.createCustomReport(req.user!.organizationId, req.body);
      res.status(201).json({ data: report });
    } catch (err) {
      next(err);
    }
  },

  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const format = (req.query.format as 'pdf' | 'excel' | 'csv') ?? 'csv';
      const exportPayload = await reportsService.exportReport(
        req.user!.organizationId,
        req.params.id as string,
        format,
      );
      res.json({ data: exportPayload });
    } catch (err) {
      next(err);
    }
  },
};
