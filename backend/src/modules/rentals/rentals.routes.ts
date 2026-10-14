import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { validateQuery } from '../../shared/middlewares/validateQuery.js';
import { rentalsController } from './rentals.controller.js';
import {
  checkAvailabilityQuerySchema,
  createRentaSchema,
  listRentalsQuerySchema,
  updateRentaEstadoSchema,
} from './rentals.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin')];
const clientOnly = [authenticate, authorize('client')];

router.get('/', [...adminOnly], validateQuery(listRentalsQuerySchema), rentalsController.list);
router.get('/mine', [...clientOnly], rentalsController.myRentals);
router.get(
  '/check-availability',
  validateQuery(checkAvailabilityQuerySchema),
  rentalsController.checkAvailability
);
router.get('/:id', authenticate, rentalsController.getById);

router.post('/', [...clientOnly], validateRequest(createRentaSchema), rentalsController.create);
router.patch(
  '/:id/estado',
  [...adminOnly],
  validateRequest(updateRentaEstadoSchema),
  rentalsController.updateEstado
);
router.patch('/:id/cancelar', authenticate, rentalsController.cancel);

export default router;