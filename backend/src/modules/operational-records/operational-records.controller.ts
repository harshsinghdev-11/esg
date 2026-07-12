import { Request, Response, NextFunction } from 'express';
import { operationalRecordsService } from './operational-records.service.js';

export const operationalRecordsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await operationalRecordsService.list(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await operationalRecordsService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await operationalRecordsService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: record });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await operationalRecordsService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: record });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await operationalRecordsService.delete(req.user!.organizationId, req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await operationalRecordsService.calculate(req.user!.organizationId, req.params.id as string, req.user!.employeeId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
