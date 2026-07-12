import { Router } from 'express';
import { categoriesController } from './categories.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createCategorySchema, updateCategorySchema } from './categories.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', categoriesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createCategorySchema), categoriesController.create);
router.get('/:id', categoriesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateCategorySchema), categoriesController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), categoriesController.delete);

export default router;
