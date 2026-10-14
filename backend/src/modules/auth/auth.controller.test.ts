import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthResponseWithRefresh } from './auth.types.js';

const mocks = vi.hoisted(() => ({
  adminLogin: vi.fn(),
  clientLogin: vi.fn(),
  clientRegister: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock('./auth.service.js', () => ({
  authService: {
    adminLogin: mocks.adminLogin,
    clientLogin: mocks.clientLogin,
    clientRegister: mocks.clientRegister,
    refreshToken: mocks.refreshToken,
    logout: mocks.logout,
    getCurrentUser: mocks.getCurrentUser,
  },
}));

vi.mock('../../config/env.js', () => ({
  env: {
    cookie: {
      name: 'refresh_token',
      domain: undefined,
      secure: false,
      sameSite: 'strict',
    },
  },
}));

import { authController } from './auth.controller.js';

function makeResult(overrides: Partial<AuthResponseWithRefresh> = {}): AuthResponseWithRefresh {
  return {
    user: { id: 'admin-1', nombre: 'Admin Uno', email: 'admin@rentx.com', rol: 'admin' },
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    ...overrides,
  };
}

function mockRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response;
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    cookies: {},
    user: { id: 'admin-1', rol: 'admin' },
    ...overrides,
  } as Request;
}

async function callProxy(fn: () => Promise<void>): Promise<void> {
  await fn();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthController - cookies', () => {
  it.each([
    ['adminLogin', (res: Response, next: NextFunction) => authController.adminLogin(makeReq() as Request, res, next)],
    ['clientLogin', (res: Response, next: NextFunction) => authController.clientLogin(makeReq() as Request, res, next)],
    ['clientRegister', (res: Response, next: NextFunction) => authController.clientRegister(makeReq() as Request, res, next)],
  ])('%s guarda refreshToken (no accessToken) en la cookie y no lo expone en el JSON', async (name, invoke) => {
    if (name === 'adminLogin') mocks.adminLogin.mockResolvedValue(makeResult());
    if (name === 'clientLogin') mocks.clientLogin.mockResolvedValue(makeResult());
    if (name === 'clientRegister') mocks.clientRegister.mockResolvedValue(makeResult());

    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await callProxy(() => invoke(res, next));

    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'strict', secure: false })
    );
    const cookieMock = res.cookie as unknown as ReturnType<typeof vi.fn>;
    expect(cookieMock.mock.calls[0][1]).toBe('refresh-token');
    expect(cookieMock.mock.calls[0][1]).not.toBe('access-token');

    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
    expect(body.accessToken).toBe('access-token');
    expect(body).not.toHaveProperty('refreshToken');
    expect(JSON.stringify(body)).not.toContain('refresh-token');
  });

  it('refresh rota la cookie con el nuevo refreshToken y devuelve solo accessToken en el JSON', async () => {
    mocks.refreshToken.mockResolvedValue({
      accessToken: 'access-token-2',
      refreshToken: 'refresh-token-2',
    });

    const res = mockRes();
    const req = makeReq({ cookies: { refresh_token: 'old-refresh-token' } });
    const next = vi.fn() as NextFunction;

    await authController.refresh(req, res, next);

    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token-2',
      expect.objectContaining({ httpOnly: true })
    );
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
    expect(body).toEqual({ accessToken: 'access-token-2' });
    expect(body).not.toHaveProperty('refreshToken');
  });

  it('logout limpia la cookie de refresh', async () => {
    mocks.logout.mockResolvedValue(undefined);

    const res = mockRes();
    const req = makeReq({ cookies: { refresh_token: 'old-refresh-token' } });
    const next = vi.fn() as NextFunction;

    await authController.logout(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      expect.objectContaining({ httpOnly: true })
    );
  });
});