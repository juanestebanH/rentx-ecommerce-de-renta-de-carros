import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { validateQuery } from '../../shared/middlewares/validateQuery.js';
import { clientsController } from './clients.controller.js';
import { listClientsQuerySchema, updateClienteEstadoSchema } from './clients.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin')];

router.get('/', [...adminOnly], validateQuery(listClientsQuerySchema), clientsController.list);
router.get('/:id/rentals', [...adminOnly], clientsController.getRentals);
router.get('/:id', [...adminOnly], clientsController.getById);
router.patch(
  '/:id/estado',
  [...adminOnly],
  validateRequest(updateClienteEstadoSchema),
  clientsController.updateEstado
);

export default router;