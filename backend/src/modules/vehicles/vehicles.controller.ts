import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/utils/AppError.js';
import { vehiclesService } from './vehicles.service.js';
import type { VehiclesRequester } from './vehicles.service.js';
import type { VehicleFilter } from './vehicles.types.js';

export class VehiclesController {
  listVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as VehicleFilter;
      const requester: VehiclesRequester | undefined = req.user;
      const vehicles = await vehiclesService.list(filters, requester);
      res.status(200).json(vehicles);
    } catch (error) {
      next(error);
    }
  };

  getVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await vehiclesService.findById(req.params.id);
      if (!vehicle) {
        next(new AppError('Vehículo no encontrado', 404));
        return;
      }
      res.status(200).json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await vehiclesService.create(req.body);
      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await vehiclesService.update(req.params.id, req.body);
      res.status(200).json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await vehiclesService.remove(req.params.id);
      res.status(200).json({ message: 'Vehículo marcado como inactivo' });
    } catch (error) {
      next(error);
    }
  };

  updateEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await vehiclesService.updateEstado(req.params.id, req.body.estado);
      res.status(200).json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  uploadPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        next(new AppError('No se envió ningún archivo en el campo "photo"', 400));
        return;
      }

      const url = await vehiclesService.uploadPhoto(req.file);
      res.status(200).json({ url });
    } catch (error) {
      next(error);
    }
  };
}

export const vehiclesController = new VehiclesController();