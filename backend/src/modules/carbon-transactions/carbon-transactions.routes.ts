import { Router } from 'express';
import { carbonTransactionsController } from './carbon-transactions.controller.js';
import { authMiddleware, rbac } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCarbonTransactionSchema, updateCarbonTransactionSchema } from './carbon-transactions.types.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', carbonTransactionsController.summary);
router.post('/auto-calculate', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), carbonTransactionsController.autoCalculate);

router.get('/', carbonTransactionsController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(createCarbonTransactionSchema), carbonTransactionsController.create);
router.get('/:id', carbonTransactionsController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(updateCarbonTransactionSchema), carbonTransactionsController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), carbonTransactionsController.delete);

export { router as carbonTransactionsRouter };
