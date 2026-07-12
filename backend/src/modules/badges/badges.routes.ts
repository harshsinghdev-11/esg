import { Router } from 'express';
import { badgesController } from './badges.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createBadgeSchema, updateBadgeSchema } from './badges.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', badgesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createBadgeSchema), badgesController.create);
router.get('/:id', badgesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateBadgeSchema), badgesController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), badgesController.delete);
router.get('/:id/holders', badgesController.getHolders);

export default router;
