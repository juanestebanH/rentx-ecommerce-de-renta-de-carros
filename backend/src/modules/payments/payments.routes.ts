import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { paymentsController } from './payments.controller.js';
import { createPagoSchema, updatePagoEstadoSchema } from './payments.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin')];

router.get('/renta/:id_renta', authenticate, paymentsController.listByRenta);
router.post('/', authenticate, validateRequest(createPagoSchema), paymentsController.create);
router.patch(
  '/:id/estado',
  [...adminOnly],
  validateRequest(updatePagoEstadoSchema),
  paymentsController.updateEstado
);

export default router;