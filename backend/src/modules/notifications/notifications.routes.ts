import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { notificationsController } from './notifications.controller.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', notificationsController.list);
router.patch('/read-all', notificationsController.markAllRead);
router.get('/:id', notificationsController.getById);
router.patch('/:id/read', notificationsController.markRead);

export { router as notificationsRouter };
