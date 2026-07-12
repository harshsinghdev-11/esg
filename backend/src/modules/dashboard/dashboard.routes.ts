import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { dashboardController } from './dashboard.controller.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/environmental', dashboardController.getEnvironmental);
router.get('/social', dashboardController.getSocial);
router.get('/governance', dashboardController.getGovernance);
router.get('/gamification', dashboardController.getGamification);
router.get('/overview', dashboardController.getOverview);

export { router as dashboardRouter };
