import { Request, Response, NextFunction } from 'express';
import { challengesService } from './challenges.service.js';

export const challengesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await challengesService.list(req.user!.organizationId, req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const challenge = await challengesService.getById(req.user!.organizationId, req.params.id as string);
      res.json({ data: challenge });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const challenge = await challengesService.create(req.user!.organizationId, req.body);
      res.status(201).json({ data: challenge });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const challenge = await challengesService.update(req.user!.organizationId, req.params.id as string, req.body);
      res.json({ data: challenge });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const challenge = await challengesService.updateStatus(req.user!.organizationId, req.params.id as string, req.body.status);
      res.json({ data: challenge });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await challengesService.delete(req.user!.organizationId, req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getParticipants(req: Request, res: Response, next: NextFunction) {
    try {
      const participants = await challengesService.getParticipants(req.user!.organizationId, req.params.id as string);
      res.json({ data: participants });
    } catch (err) {
      next(err);
    }
  }
};
