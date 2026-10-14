import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service.js';
import type { AgruparPor } from './reports.types.js';
import type { DateRange } from '../../shared/utils/dateRange.js';

interface PeriodoQuery {
  desde: string;
  hasta: string;
}

export class ReportsController {
  dashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await reportsService.dashboard();
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  rentasRecientes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await reportsService.rentasRecientes();
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  ingresosMensuales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { meses } = req.query as { meses?: number };
      const report = await reportsService.ingresosMensuales(meses ?? 6);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  estadoFlota = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await reportsService.estadoFlota();
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  resumenPeriodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await reportsService.resumenPeriodo(periodoDe(req));
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  ingresosPeriodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { agrupar } = req.query as unknown as { agrupar: AgruparPor };
      const report = await reportsService.ingresosEnElTiempo(periodoDe(req), agrupar);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  rankingVehiculos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { limite } = req.query as unknown as { limite: number };
      const report = await reportsService.rankingVehiculos(periodoDe(req), limite);
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  ingresosCategoria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await reportsService.ingresosPorCategoria(periodoDe(req));
      res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };
}

function periodoDe(req: Request): DateRange {
  const { desde, hasta } = req.query as unknown as PeriodoQuery;
  return { desde, hasta };
}

export const reportsController = new ReportsController();