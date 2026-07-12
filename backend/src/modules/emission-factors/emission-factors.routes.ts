import { Router } from 'express';
import { emissionFactorsController } from './emission-factors.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createEmissionFactorSchema, updateEmissionFactorSchema } from './emission-factors.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', emissionFactorsController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createEmissionFactorSchema), emissionFactorsController.create);
router.get('/:id', emissionFactorsController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateEmissionFactorSchema), emissionFactorsController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), emissionFactorsController.delete);

export default router;
