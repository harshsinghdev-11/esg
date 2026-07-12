import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { auditsController } from './audits.controller.js';
import { createAuditSchema, updateAuditSchema } from './audits.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', auditsController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'AUDITOR']), validate(createAuditSchema), auditsController.create);
router.get('/:id/issues', auditsController.getIssues);
router.get('/:id', auditsController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'AUDITOR']), validate(updateAuditSchema), auditsController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'AUDITOR']), auditsController.delete);

export { router as auditsRouter };
