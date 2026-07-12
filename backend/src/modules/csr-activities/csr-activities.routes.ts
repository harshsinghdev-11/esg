import { Router } from 'express';
import { csrActivitiesController } from './csr-activities.controller.js';
import { authMiddleware, rbac } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCsrActivitySchema, updateCsrActivitySchema } from './csr-activities.types.js';
import { participateSchema } from '../participations/participations.types.js';
import { participationsController } from '../participations/participations.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', csrActivitiesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(createCsrActivitySchema), csrActivitiesController.create);
router.get('/:id', csrActivitiesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(updateCsrActivitySchema), csrActivitiesController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), csrActivitiesController.delete);
router.get('/:id/participants', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), csrActivitiesController.getParticipants);

router.post('/:id/participate', rbac(['EMPLOYEE']), validate(participateSchema), participationsController.participate);

export { router as csrActivitiesRouter };
