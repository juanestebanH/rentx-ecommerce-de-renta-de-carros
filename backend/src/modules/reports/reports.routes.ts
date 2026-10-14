import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateQuery } from '../../shared/middlewares/validateQuery.js';
import { reportsController } from './reports.controller.js';
import {
  ingresosCategoriaQuerySchema,
  ingresosMensualesQuerySchema,
  ingresosPeriodoQuerySchema,
  rankingVehiculosQuerySchema,
  resumenPeriodoQuerySchema,
} from './reports.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin')];

router.get('/dashboard', [...adminOnly], reportsController.dashboard);
router.get('/rentas-recientes', [...adminOnly], reportsController.rentasRecientes);
router.get(
  '/ingresos-mensuales',
  [...adminOnly],
  validateQuery(ingresosMensualesQuerySchema),
  reportsController.ingresosMensuales
);
router.get('/estado-flota', [...adminOnly], reportsController.estadoFlota);

// Reportes de periodo (pantalla de Reportes del admin).
router.get(
  '/resumen-periodo',
  [...adminOnly],
  validateQuery(resumenPeriodoQuerySchema),
  reportsController.resumenPeriodo
);
router.get(
  '/ingresos-periodo',
  [...adminOnly],
  validateQuery(ingresosPeriodoQuerySchema),
  reportsController.ingresosPeriodo
);
router.get(
  '/ranking-vehiculos',
  [...adminOnly],
  validateQuery(rankingVehiculosQuerySchema),
  reportsController.rankingVehiculos
);
router.get(
  '/ingresos-categoria',
  [...adminOnly],
  validateQuery(ingresosCategoriaQuerySchema),
  reportsController.ingresosCategoria
);

export default router;