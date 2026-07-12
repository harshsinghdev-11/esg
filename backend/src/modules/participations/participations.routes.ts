import { Router } from 'express';
import { participationsController } from './participations.controller.js';
import { authMiddleware, rbac } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { participateSchema } from './participations.types.js';

const router = Router();

router.use(authMiddleware);

router.get('/', participationsController.list);
router.get('/:id', participationsController.getById);

router.patch('/:id/approve', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), participationsController.approve);
router.patch('/:id/reject', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), participationsController.reject);

export { router as participationsRouter };
