import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/utils/AppError.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import { authRepository } from './auth.repository.js';
import type {
  AdminUser,
  ClientUser,
  JwtPayload,
  TokenPair,
  AdminLoginInput,
  ClientLoginInput,
  ClientRegisterInput,
  AuthResponse,
  AuthResponseWithRefresh,
} from './auth.types.js';

const BCRYPT_ROUNDS = 10;

export class AuthService {
  async adminLogin(input: AdminLoginInput): Promise<AuthResponseWithRefresh> {
    const adminUser = await authRepository.findAdminById(input.id_usuario);

    if (!adminUser) {
      throw new AppError('Invalid credentials', 401);
    }

    if (adminUser.estado !== 'activo') {
      throw new AppError('User is inactive', 403);
    }

    const isValidPassword = await bcrypt.compare(
      input.contrasena,
      adminUser.contrasena,
    );
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens({
      id: adminUser.id_usuario,
      rol: 'admin',
    });
    await this.storeRefreshToken(
      adminUser.id_usuario,
      tokens.refreshToken,
      'admin',
    );

    return {
      user: {
        id: adminUser.id_usuario,
        nombre: adminUser.nombre,
        email: adminUser.email,
        rol: 'admin',
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async clientLogin(input: ClientLoginInput): Promise<AuthResponseWithRefresh> {
    const clientUser = await authRepository.findClientByEmail(input.email);

    if (!clientUser) {
      throw new AppError('Invalid credentials', 401);
    }

    if (clientUser.contrasena === null) {
      throw new AppError('Este usuario debe registrar una contraseña', 403);
    }

    const isValidPassword = await bcrypt.compare(
      input.contrasena,
      clientUser.contrasena,
    );
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokens = this.generateTokens({
      id: clientUser.id_cliente,
      rol: 'client',
    });
    await this.storeRefreshToken(
      clientUser.id_cliente,
      tokens.refreshToken,
      'client',
    );

    return {
      user: {
        id: clientUser.id_cliente,
        nombre: `${clientUser.nombres} ${clientUser.apellidos}`,
        email: clientUser.email,
        rol: 'client',
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async clientRegister(input: ClientRegisterInput): Promise<AuthResponseWithRefresh> {
    const idCliente = normalizeIdentifier(input.numero_licencia);
    const exists = await authRepository.emailExists(input.email);
    if (exists) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(input.contrasena, BCRYPT_ROUNDS);

    const clientUser = await authRepository.insertClient({
      id_cliente: idCliente,
      nombres: input.nombres,
      apellidos: input.apellidos,
      email: input.email,
      telefono: input.telefono,
      fecha_nacimiento: input.fecha_nacimiento,
      numero_licencia: idCliente,
      pais_emision: input.pais_emision,
      fecha_vencimiento: input.fecha_vencimiento,
      contrasena: hashedPassword,
    });

    const tokens = this.generateTokens({
      id: clientUser.id_cliente,
      rol: 'client',
    });
    await this.storeRefreshToken(
      clientUser.id_cliente,
      tokens.refreshToken,
      'client',
    );

    return {
      user: {
        id: clientUser.id_cliente,
        nombre: `${clientUser.nombres} ${clientUser.apellidos}`,
        email: clientUser.email,
        rol: 'client',
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(
    refreshToken: string | undefined,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw new AppError('Refresh token not provided', 401);
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const storedToken = await authRepository.findRefreshToken(
      refreshToken,
      payload.id,
      payload.rol,
    );

    if (!storedToken) {
      throw new AppError('Refresh token not found or revoked', 401);
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await authRepository.deleteRefreshToken(refreshToken);
      throw new AppError('Refresh token expired', 401);
    }

    await authRepository.deleteRefreshToken(refreshToken);

    const tokens = this.generateTokens({ id: payload.id, rol: payload.rol });
    await this.storeRefreshToken(payload.id, tokens.refreshToken, payload.rol);

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  async getCurrentUser(payload: JwtPayload): Promise<AuthResponse['user']> {
    if (payload.rol === 'admin') {
      const adminUser = await authRepository.findAdminById(payload.id);

      if (!adminUser) {
        throw new AppError('User not found', 404);
      }

      if (adminUser.estado !== 'activo') {
        throw new AppError('User is inactive', 401);
      }

      return {
        id: adminUser.id_usuario,
        nombre: adminUser.nombre,
        email: adminUser.email,
        rol: 'admin',
      };
    }

    const clientUser = await authRepository.findClientById(payload.id);

    if (!clientUser) {
      throw new AppError('User not found', 404);
    }

    return {
      id: clientUser.id_cliente,
      nombre: `${clientUser.nombres} ${clientUser.apellidos}`,
      email: clientUser.email,
      rol: 'client',
    };
  }

  async logout(
    refreshToken: string | undefined,
    userId: string,
    userType: 'admin' | 'client',
  ): Promise<void> {
    if (refreshToken) {
      await authRepository.deleteRefreshTokenByUser(refreshToken, userId, userType);
    }
  }

  private generateTokens(payload: JwtPayload): TokenPair {
    const accessToken = jwt.sign(payload, env.jwt.accessSecret, {
      expiresIn: env.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    userType: 'admin' | 'client',
  ): Promise<void> {
    const decoded = jwt.decode(refreshToken) as { exp?: number };
    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await authRepository.storeRefreshToken(userId, refreshToken, userType, expiresAt);
  }
}

export const authService = new AuthService();
