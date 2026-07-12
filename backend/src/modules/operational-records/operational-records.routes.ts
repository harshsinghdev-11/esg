import { Router } from 'express';
import { operationalRecordsController } from './operational-records.controller.js';
import { authMiddleware, rbac } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createOperationalRecordSchema, updateOperationalRecordSchema } from './operational-records.types.js';

const router = Router();

router.use(authMiddleware);

router.get('/', operationalRecordsController.list);
router.post('/', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(createOperationalRecordSchema), operationalRecordsController.create);
router.get('/:id', operationalRecordsController.getById);
router.patch('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER', 'DEPT_HEAD']), validate(updateOperationalRecordSchema), operationalRecordsController.update);
router.delete('/:id', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), operationalRecordsController.delete);
router.post('/:id/calculate', rbac(['SUPER_ADMIN', 'ESG_MANAGER']), operationalRecordsController.calculate);

export { router as operationalRecordsRouter };
