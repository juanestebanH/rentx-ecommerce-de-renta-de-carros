import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate.js';
import { authorize } from '../../shared/middlewares/authorize.js';
import { validateRequest } from '../../shared/middlewares/validateRequest.js';
import { catalogController } from './catalog.controller.js';
import {
  createCategoriaSchema,
  createMarcaSchema,
  updateCategoriaSchema,
  updateMarcaSchema,
} from './catalog.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin')];

router.get('/marcas', catalogController.listMarcas);
router.post('/marcas', [...adminOnly], validateRequest(createMarcaSchema), catalogController.createMarca);
router.put('/marcas/:nombre', [...adminOnly], validateRequest(updateMarcaSchema), catalogController.updateMarca);
router.delete('/marcas/:nombre', [...adminOnly], catalogController.deleteMarca);

router.get('/categorias', catalogController.listCategorias);
router.post(
  '/categorias',
  [...adminOnly],
  validateRequest(createCategoriaSchema),
  catalogController.createCategoria
);
router.put(
  '/categorias/:nombre',
  [...adminOnly],
  validateRequest(updateCategoriaSchema),
  catalogController.updateCategoria
);
router.delete('/categorias/:nombre', [...adminOnly], catalogController.deleteCategoria);

export default router;