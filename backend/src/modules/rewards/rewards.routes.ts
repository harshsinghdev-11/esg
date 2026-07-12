import { Router } from 'express';
import { rewardsController } from './rewards.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { rbac } from '../../middleware/rbac.middleware.js';
import { createRewardSchema, updateRewardSchema, updateRedemptionSchema } from './rewards.types.js';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

// Rewards
router.get('/rewards', rewardsController.list);
router.post('/rewards', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createRewardSchema), rewardsController.create);
router.get('/rewards/:id', rewardsController.getById);
router.patch('/rewards/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateRewardSchema), rewardsController.update);
router.delete('/rewards/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), rewardsController.delete);
router.post('/rewards/:id/redeem', rewardsController.redeem);

// Redemptions
router.get('/redemptions', rewardsController.listRedemptions);
router.get('/redemptions/:id', rewardsController.getRedemptionById);
router.patch('/redemptions/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateRedemptionSchema), rewardsController.updateRedemption);

export default router;
