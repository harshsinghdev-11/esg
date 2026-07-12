import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { scoresController } from './scores.controller.js';
import { recalculateDepartmentScoreSchema } from './scores.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/departments', scoresController.listDepartmentScores);
router.get('/departments/:id', scoresController.getDepartmentScore);
router.post(
  '/departments/:id/recalculate',
  rbac(['SUPER_ADMIN', 'ESG_MANAGER']),
  validate(recalculateDepartmentScoreSchema),
  scoresController.recalculateDepartmentScore,
);
router.get('/organization', scoresController.getOrganizationScore);

export { router as scoresRouter };
