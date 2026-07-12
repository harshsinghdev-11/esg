import { Router } from 'express';
import { policiesController } from './policies.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createPolicySchema, updatePolicySchema } from './policies.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', policiesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createPolicySchema), policiesController.create);
router.get('/:id', policiesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updatePolicySchema), policiesController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), policiesController.delete);
router.get('/:id/acknowledgements', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), policiesController.getAcknowledgements);
router.post('/:id/acknowledge', policiesController.acknowledge);
router.post('/:id/remind', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), policiesController.remind);

export default router;
