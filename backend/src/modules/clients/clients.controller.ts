import { Request, Response, NextFunction } from 'express';
import { clientsService } from './clients.service.js';
import type { ClientFilter } from './clients.types.js';

export class ClientsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as ClientFilter;
      const clients = await clientsService.list(filters);
      res.status(200).json(clients);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = await clientsService.findById(req.params.id);
      res.status(200).json(client);
    } catch (error) {
      next(error);
    }
  };

  getRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rentals = await clientsService.rentalHistory(req.params.id);
      res.status(200).json(rentals);
    } catch (error) {
      next(error);
    }
  };

  updateEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = await clientsService.updateEstado(req.params.id, req.body.estado);
      res.status(200).json(client);
    } catch (error) {
      next(error);
    }
  };
}

export const clientsController = new ClientsController();