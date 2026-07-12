import { Request, Response, NextFunction } from 'express';
import { carbonTransactionsService } from './carbon-transactions.service.js';

export const carbonTransactionsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await carbonTransactionsService.list(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await carbonTransactionsService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: transaction });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await carbonTransactionsService.create(req.user!.organizationId, req.body, req.user!.employeeId);
      res.status(201).json({ data: transaction });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await carbonTransactionsService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: transaction });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await carbonTransactionsService.delete(req.user!.organizationId, req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await carbonTransactionsService.summary(req.user!.organizationId, req.query);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async autoCalculate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await carbonTransactionsService.autoCalculate(req.user!.organizationId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
};
