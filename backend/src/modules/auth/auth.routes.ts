import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { loginRateLimiter } from '../../shared/middlewares/rateLimit.js';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import {
  adminLoginSchema,
  clientLoginSchema,
  clientRegisterSchema,
  logoutSchema,
} from './auth.schema.js';

const router = Router();

router.get('/me', authenticate, authController.me);

router.post(
  '/admin/login',
  loginRateLimiter,
  validateRequest(adminLoginSchema),
  authController.adminLogin
);

router.post(
  '/client/login',
  loginRateLimiter,
  validateRequest(clientLoginSchema),
  authController.clientLogin
);

router.post(
  '/client/register',
  validateRequest(clientRegisterSchema),
  authController.clientRegister
);

router.post('/refresh', authController.refresh);

router.post(
  '/logout',
  authenticate,
  validateRequest(logoutSchema),
  authController.logout
);

export default router;