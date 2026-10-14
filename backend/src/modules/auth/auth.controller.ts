import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { AppError } from '../../shared/utils/AppError.js';
import { env } from '../../config/env.js';
import type { AuthResponseWithRefresh } from './auth.types.js';

export class AuthController {
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next(new AppError('No token provided', 401));
        return;
      }
      const user = await authService.getCurrentUser(req.user);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.adminLogin(req.body);
      this.setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  clientLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.clientLogin(req.body);
      this.setRefreshCookie(res, result.refreshToken);
      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  clientRegister = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.clientRegister(req.body);
      this.setRefreshCookie(res, result.refreshToken);
      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token;
      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);
      this.setRefreshCookie(res, newRefreshToken);
      res.status(200).json({ accessToken });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token;
      if (req.user) {
        await authService.logout(refreshToken, req.user.id, req.user.rol);
      }
      this.clearRefreshCookie(res);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.cookie.secure,
      sameSite: env.cookie.sameSite,
      domain: env.cookie.domain,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: env.cookie.secure,
      sameSite: env.cookie.sameSite,
      domain: env.cookie.domain,
    });
  }
}

export const authController = new AuthController();