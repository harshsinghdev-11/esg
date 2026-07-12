import { Router } from 'express';
import { environmentalGoalsController } from './environmental-goals.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createEnvironmentalGoalSchema, updateEnvironmentalGoalSchema } from './environmental-goals.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', environmentalGoalsController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createEnvironmentalGoalSchema), environmentalGoalsController.create);
router.get('/:id', environmentalGoalsController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateEnvironmentalGoalSchema), environmentalGoalsController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), environmentalGoalsController.delete);

export default router;
