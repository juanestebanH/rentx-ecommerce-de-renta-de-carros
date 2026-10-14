import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import type { AdminUserFilter } from './users.types.js';
import type { JwtPayload } from '../../shared/middlewares/authenticate.js';

export class UsersController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as unknown as AdminUserFilter;
      const users = await usersService.list(filters);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.findById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await usersService.update(req.params.id, req.body);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  updateEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requesterId = (req.user as JwtPayload).id;
      const user = await usersService.updateEstado(req.params.id, req.body.estado, requesterId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();