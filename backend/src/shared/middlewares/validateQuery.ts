import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      req.query = parsed as Request['query'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues ?? [];
        const messages = issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        next(new AppError(messages, 400));
      } else {
        next(new AppError('Invalid query parameters', 400));
      }
    }
  };
};