import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { settingsController } from './settings.controller.js';
import { updateEsgConfigurationSchema } from './settings.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/esg-configuration', settingsController.getConfiguration);
router.patch(
  '/esg-configuration',
  rbac(['SUPER_ADMIN', 'ESG_MANAGER']),
  validate(updateEsgConfigurationSchema),
  settingsController.updateConfiguration,
);

export { router as settingsRouter };
