import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { validateQuery } from '../../shared/middlewares/validateQuery.js';
import { usersController } from './users.controller.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserEstadoSchema,
  updateUserSchema,
} from './users.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin')];

router.get('/', [...adminOnly], validateQuery(listUsersQuerySchema), usersController.list);
router.get('/:id', [...adminOnly], usersController.getById);
router.post('/', [...adminOnly], validateRequest(createUserSchema), usersController.create);
router.put('/:id', [...adminOnly], validateRequest(updateUserSchema), usersController.update);
router.patch(
  '/:id/estado',
  [...adminOnly],
  validateRequest(updateUserEstadoSchema),
  usersController.updateEstado
);

export default router;