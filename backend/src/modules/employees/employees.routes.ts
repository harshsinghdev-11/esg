import { Router } from 'express';
import { employeesController } from './employees.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createEmployeeSchema, updateEmployeeSchema } from './employees.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD', 'AUDITOR']), employeesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(createEmployeeSchema), employeesController.create);
router.get('/:id', employeesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(updateEmployeeSchema), employeesController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), employeesController.delete);

router.get('/:id/xp-history', employeesController.getXpHistory);
router.get('/:id/badges', employeesController.getBadges);
router.get('/:id/participations', employeesController.getParticipations);
router.get('/:id/notifications', employeesController.getNotifications);

export default router;
