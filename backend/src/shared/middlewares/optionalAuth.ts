import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, env.jwt.accessSecret) as Express.Request['user'];
  } catch {
    // Token inválido o expirado: la ruta es pública, se sigue sin req.user.
  }

  next();
};