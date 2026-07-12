import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { loginSchema, registerSchema } from './auth.types.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);
// Placeholder for logout and refresh which aren't strictly required right now.

export default router;
