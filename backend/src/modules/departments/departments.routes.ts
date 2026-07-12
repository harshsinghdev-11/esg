import { Router } from 'express';
import { departmentsController } from './departments.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createDepartmentSchema, updateDepartmentSchema } from './departments.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', departmentsController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createDepartmentSchema), departmentsController.create);
router.get('/:id', departmentsController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateDepartmentSchema), departmentsController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), departmentsController.delete);
router.get('/:id/hierarchy', departmentsController.getHierarchy);
router.get('/:id/employees', departmentsController.getEmployees);

export default router;
