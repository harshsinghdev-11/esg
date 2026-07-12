import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { reportsController } from './reports.controller.js';
import { createCustomReportSchema } from './reports.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);
router.use(rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD', 'AUDITOR']));

router.get('/environmental', reportsController.getEnvironmental);
router.get('/social', reportsController.getSocial);
router.get('/governance', reportsController.getGovernance);
router.get('/esg-summary', reportsController.getEsgSummary);
router.post('/custom', validate(createCustomReportSchema), reportsController.createCustom);
router.get('/:id/export', reportsController.export);

export { router as reportsRouter };
