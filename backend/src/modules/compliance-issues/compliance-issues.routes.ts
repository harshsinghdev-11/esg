import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { complianceIssuesController } from './compliance-issues.controller.js';
import {
  createComplianceIssueSchema,
  updateComplianceIssueSchema,
} from './compliance-issues.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/overdue', complianceIssuesController.getOverdue);
router.get('/', complianceIssuesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'AUDITOR']), validate(createComplianceIssueSchema), complianceIssuesController.create);
router.get('/:id', complianceIssuesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'AUDITOR']), validate(updateComplianceIssueSchema), complianceIssuesController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'AUDITOR']), complianceIssuesController.delete);

export { router as complianceIssuesRouter };
