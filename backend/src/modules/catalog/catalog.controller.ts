import { Request, Response, NextFunction } from 'express';
import { catalogService } from './catalog.service.js';

export class CatalogController {
  listMarcas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const marcas = await catalogService.listMarcas();
      res.status(200).json(marcas);
    } catch (error) {
      next(error);
    }
  };

  createMarca = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const marca = await catalogService.createMarca(req.body.nombre);
      res.status(201).json(marca);
    } catch (error) {
      next(error);
    }
  };

  updateMarca = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const marca = await catalogService.updateMarca(req.params.nombre, req.body.nombre);
      res.status(200).json(marca);
    } catch (error) {
      next(error);
    }
  };

  deleteMarca = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await catalogService.deleteMarca(req.params.nombre);
      res.status(200).json({ message: 'Marca eliminada con éxito' });
    } catch (error) {
      next(error);
    }
  };

  listCategorias = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categorias = await catalogService.listCategorias();
      res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  };

  createCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoria = await catalogService.createCategoria(req.body.nombre);
      res.status(201).json(categoria);
    } catch (error) {
      next(error);
    }
  };

  updateCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoria = await catalogService.updateCategoria(req.params.nombre, req.body.nombre);
      res.status(200).json(categoria);
    } catch (error) {
      next(error);
    }
  };

  deleteCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await catalogService.deleteCategoria(req.params.nombre);
      res.status(200).json({ message: 'Categoría eliminada con éxito' });
    } catch (error) {
      next(error);
    }
  };
}

export const catalogController = new CatalogController();