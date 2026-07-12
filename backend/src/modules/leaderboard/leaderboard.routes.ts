import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', leaderboardController.getEmployeeRankings);
router.get('/departments', leaderboardController.getDepartmentRankings);

export { router as leaderboardRouter };
