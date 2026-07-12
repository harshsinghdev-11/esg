import { Router } from 'express';
import { challengesController } from './challenges.controller.js';
import { authMiddleware, rbac } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createChallengeSchema, updateChallengeSchema } from './challenges.types.js';
import { joinChallengeSchema } from '../challenge-participations/challenge-participations.types.js';
import { challengeParticipationsController } from '../challenge-participations/challenge-participations.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', challengesController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(createChallengeSchema), challengesController.create);
router.get('/:id', challengesController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), validate(updateChallengeSchema), challengesController.update);
router.patch('/:id/status', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), challengesController.updateStatus);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), challengesController.delete);
router.get('/:id/participants', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), challengesController.getParticipants);

router.post('/:id/join', rbac(['EMPLOYEE']), validate(joinChallengeSchema), challengeParticipationsController.join);

export { router as challengesRouter };
