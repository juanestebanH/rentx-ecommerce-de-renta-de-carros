import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const authorize = (...allowedRoles: ('admin' | 'client')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Not authenticated', 401));
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      next(new AppError('Insufficient permissions', 403));
      return;
    }

    next();
  };
};