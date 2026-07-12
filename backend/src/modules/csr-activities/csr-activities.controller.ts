import { Request, Response, NextFunction } from 'express';
import { csrActivitiesService } from './csr-activities.service.js';

export const csrActivitiesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await csrActivitiesService.list(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await csrActivitiesService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: activity });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await csrActivitiesService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: activity });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await csrActivitiesService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: activity });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await csrActivitiesService.delete(req.user!.organizationId, req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const participants = await csrActivitiesService.getParticipants(req.user!.organizationId, req.params.id as string);
      res.json({ data: participants });
    } catch (err) {
      next(err);
    }
  }
};
