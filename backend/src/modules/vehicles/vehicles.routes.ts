import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { optionalAuth } from '../../shared/middlewares/optionalAuth.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { validateQuery } from '../../shared/middlewares/validateQuery.js';
import { vehiclesController } from './vehicles.controller.js';
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateEstadoSchema,
  updateVehicleSchema,
} from './vehicles.schema.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const adminOnly = [authenticate, authorize('admin')];

router.get(
  '/',
  validateQuery(listVehiclesQuerySchema),
  optionalAuth,
  vehiclesController.listVehicles
);
router.get('/:id', vehiclesController.getVehicle);

router.post('/', [...adminOnly], validateRequest(createVehicleSchema), vehiclesController.createVehicle);
router.put('/:id', [...adminOnly], validateRequest(updateVehicleSchema), vehiclesController.updateVehicle);
router.delete('/:id', [...adminOnly], vehiclesController.deleteVehicle);
router.patch('/:id/estado', [...adminOnly], validateRequest(updateEstadoSchema), vehiclesController.updateEstado);
router.post('/upload-photo', [...adminOnly], upload.single('photo'), vehiclesController.uploadPhoto);

export default router;