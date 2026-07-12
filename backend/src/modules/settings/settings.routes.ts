import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { updateEsgConfigSchema } from './settings.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/esg-configuration', settingsController.getConfig);
router.patch('/esg-configuration', rbac(['SUPER_ADMIN']), validate(updateEsgConfigSchema), settingsController.updateConfig);

export default router;
