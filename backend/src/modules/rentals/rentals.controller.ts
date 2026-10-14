import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/utils/AppError.js';
import { rentalsService } from './rentals.service.js';
import type { RentaFilter } from './rentals.types.js';
import type { JwtPayload } from '../../shared/middlewares/authenticate.js';

function getRequester(req: Request): { id: string; rol: 'admin' | 'client' } {
  return (req.user as JwtPayload) ?? { id: '', rol: 'client' };
}

export class RentalsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as RentaFilter;
      const rentals = await rentalsService.list(filters);
      res.status(200).json(rentals);
    } catch (error) {
      next(error);
    }
  };

  myRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = getRequester(req);
      const rentals = await rentalsService.myRentals(id);
      res.status(200).json(rentals);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? getRequester(req) : undefined;
      const rental = await rentalsService.findById(req.params.id, requester);
      res.status(200).json(rental);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = getRequester(req);
      const rental = await rentalsService.create(req.body, id);
      res.status(201).json(rental);
    } catch (error) {
      next(error);
    }
  };

  updateEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rental = await rentalsService.updateEstado(req.params.id, req.body.estado);
      res.status(200).json(rental);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = getRequester(req);
      const rental = await rentalsService.cancel(req.params.id, requester);
      res.status(200).json(rental);
    } catch (error) {
      next(error);
    }
  };

  checkAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await rentalsService.checkAvailability(
        req.query as unknown as CheckAvailabilityQuery
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

interface CheckAvailabilityQuery {
  id_carro: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export const rentalsController = new RentalsController();