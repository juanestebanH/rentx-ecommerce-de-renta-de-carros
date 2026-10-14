import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/utils/AppError.js';
import { paymentsService } from './payments.service.js';
import type { JwtPayload } from '../../shared/middlewares/authenticate.js';

function getRequester(req: Request): { id: string; rol: 'admin' | 'client' } {
  return (req.user as JwtPayload) ?? { id: '', rol: 'client' };
}

export class PaymentsController {
  listByRenta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = getRequester(req);
      const pagos = await paymentsService.listByRenta(req.params.id_renta, requester);
      res.status(200).json(pagos);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pago = await paymentsService.create(req.body);
      res.status(201).json(pago);
    } catch (error) {
      next(error);
    }
  };

  updateEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pago = await paymentsService.updateEstado(req.params.id, req.body.estado);
      res.status(200).json(pago);
    } catch (error) {
      next(error);
    }
  };
}

export const paymentsController = new PaymentsController();