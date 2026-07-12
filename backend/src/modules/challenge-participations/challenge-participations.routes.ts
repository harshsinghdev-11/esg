import { Router } from 'express';
import { challengeParticipationsController } from './challenge-participations.controller.js';
import { authMiddleware, rbac } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateChallengeProgressSchema } from './challenge-participations.types.js';

const router = Router();

router.use(authMiddleware);

router.get('/', challengeParticipationsController.list);
router.get('/:id', challengeParticipationsController.getById);

router.patch('/:id/progress', rbac(['EMPLOYEE']), validate(updateChallengeProgressSchema), challengeParticipationsController.updateProgress);

router.patch('/:id/approve', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), challengeParticipationsController.approve);
router.patch('/:id/reject', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), challengeParticipationsController.reject);

export { router as challengeParticipationsRouter };
