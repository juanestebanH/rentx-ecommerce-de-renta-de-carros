import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from './auth.service.js';
import type { AdminUser, ClientUser, ClientRegisterInput } from './auth.types.js';
import type { RefreshTokenRow } from './auth.repository.js';

const mocks = vi.hoisted(() => ({
  findAdminById: vi.fn(),
  findClientByEmail: vi.fn(),
  findClientById: vi.fn(),
  emailExists: vi.fn(),
  insertClient: vi.fn(),
  storeRefreshToken: vi.fn(),
  findRefreshToken: vi.fn(),
  deleteRefreshToken: vi.fn(),
  deleteRefreshTokenByUser: vi.fn(),
  bcryptCompare: vi.fn(),
  bcryptHash: vi.fn(),
  jwtSign: vi.fn(),
  jwtVerify: vi.fn(),
  jwtDecode: vi.fn(),
}));

vi.mock('./auth.repository.js', () => ({
  authRepository: {
    findAdminById: mocks.findAdminById,
    findClientByEmail: mocks.findClientByEmail,
    findClientById: mocks.findClientById,
    emailExists: mocks.emailExists,
    insertClient: mocks.insertClient,
    storeRefreshToken: mocks.storeRefreshToken,
    findRefreshToken: mocks.findRefreshToken,
    deleteRefreshToken: mocks.deleteRefreshToken,
    deleteRefreshTokenByUser: mocks.deleteRefreshTokenByUser,
  },
}));

vi.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    compare: mocks.bcryptCompare,
    hash: mocks.bcryptHash,
  },
}));

vi.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: mocks.jwtSign,
    verify: mocks.jwtVerify,
    decode: mocks.jwtDecode,
  },
}));

vi.mock('../../config/env.js', () => ({
  env: {
    jwt: {
      accessSecret: 'test-access-secret',
      refreshSecret: 'test-refresh-secret',
      accessExpiry: '1h',
      refreshExpiry: '7d',
    },
  },
}));

function makeAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id_usuario: 'admin-1',
    nombre: 'Admin Uno',
    email: 'admin@rentx.com',
    contrasena: '$2a$10$admin-hashed',
    rol: 'admin',
    estado: 'activo',
    ...overrides,
  };
}

function makeClient(overrides: Partial<ClientUser> = {}): ClientUser {
  return {
    id_cliente: 'aaa-123',
    nombres: 'Juan',
    apellidos: 'Perez',
    email: 'juan@rentx.com',
    telefono: '5555-4444',
    fecha_nacimiento: '1990-01-01',
    numero_licencia: 'aaa-123',
    pais_emision: 'HN',
    fecha_vencimiento: '2027-01-01',
    contrasena: '$2a$10$client-hashed',
    ...overrides,
  };
}

function makeRefreshRow(overrides: Partial<RefreshTokenRow> = {}): RefreshTokenRow {
  return {
    token: 'refresh-token',
    user_id: 'admin-1',
    user_type: 'admin',
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    ...overrides,
  };
}

function mockTokens() {
  mocks.jwtSign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
  mocks.jwtDecode.mockReturnValue({ exp: 2_000_000_000 });
}

const registerInput: ClientRegisterInput = {
  nombres: 'Juan',
  apellidos: 'Perez',
  email: 'juan@rentx.com',
  contrasena: 'plain-123',
  telefono: '5555-4444',
  fecha_nacimiento: '1990-01-01',
  numero_licencia: 'AAA-123',
  pais_emision: 'HN',
  fecha_vencimiento: '2027-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthService.adminLogin', () => {
  it('login exitoso cuando el admin existe, está activo y el password coincide', async () => {
    const admin = makeAdmin();
    mocks.findAdminById.mockResolvedValue(admin);
    mocks.bcryptCompare.mockResolvedValue(true);
    mockTokens();

    const result = await authService.adminLogin({
      id_usuario: 'admin-1',
      contrasena: 'secret',
    });

    expect(mocks.bcryptCompare).toHaveBeenCalledWith('secret', admin.contrasena);
    expect(result.user).toEqual({
      id: 'admin-1',
      nombre: 'Admin Uno',
      email: 'admin@rentx.com',
      rol: 'admin',
    });
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mocks.storeRefreshToken).toHaveBeenCalledWith(
      'admin-1',
      'refresh-token',
      'admin',
      expect.any(String)
    );
  });

  it('rechaza (401) si el usuario no existe', async () => {
    mocks.findAdminById.mockResolvedValue(null);

    await expect(
      authService.adminLogin({ id_usuario: 'ghost', contrasena: 'x' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });

    expect(mocks.bcryptCompare).not.toHaveBeenCalled();
  });

  it('rechaza (403) si el usuario existe pero está inactivo', async () => {
    mocks.findAdminById.mockResolvedValue(makeAdmin({ estado: 'inactivo' }));

    await expect(
      authService.adminLogin({ id_usuario: 'admin-1', contrasena: 'secret' })
    ).rejects.toMatchObject({ statusCode: 403, message: 'User is inactive' });

    expect(mocks.bcryptCompare).not.toHaveBeenCalled();
  });

  it('rechaza (401) si el password no coincide', async () => {
    mocks.findAdminById.mockResolvedValue(makeAdmin());
    mocks.bcryptCompare.mockResolvedValue(false);

    await expect(
      authService.adminLogin({ id_usuario: 'admin-1', contrasena: 'wrong' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });

    expect(mocks.storeRefreshToken).not.toHaveBeenCalled();
  });
});

describe('AuthService.clientLogin', () => {
  it('login exitoso cuando el cliente existe y el password coincide', async () => {
    const client = makeClient();
    mocks.findClientByEmail.mockResolvedValue(client);
    mocks.bcryptCompare.mockResolvedValue(true);
    mockTokens();

    const result = await authService.clientLogin({
      email: 'juan@rentx.com',
      contrasena: 'secret',
    });

    expect(mocks.bcryptCompare).toHaveBeenCalledWith('secret', client.contrasena);
    expect(result.user).toEqual({
      id: 'aaa-123',
      nombre: 'Juan Perez',
      email: 'juan@rentx.com',
      rol: 'client',
    });
    expect(result.accessToken).toBe('access-token');
    expect(mocks.storeRefreshToken).toHaveBeenCalledWith('aaa-123', 'refresh-token', 'client', expect.any(String));
  });

  it('rechaza (401) si el cliente no existe', async () => {
    mocks.findClientByEmail.mockResolvedValue(null);

    await expect(
      authService.clientLogin({ email: 'nobody@rentx.com', contrasena: 'x' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });

    expect(mocks.bcryptCompare).not.toHaveBeenCalled();
  });

  it('rechaza (403) si contrasena es NULL y NUNCA llama a bcrypt.compare', async () => {
    mocks.findClientByEmail.mockResolvedValue(makeClient({ contrasena: null }));

    await expect(
      authService.clientLogin({ email: 'juan@rentx.com', contrasena: 'x' })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: 'Este usuario debe registrar una contraseña',
    });

    expect(mocks.bcryptCompare).not.toHaveBeenCalled();
    expect(mocks.storeRefreshToken).not.toHaveBeenCalled();
  });

  it('rechaza (401) si contrasena no coincide', async () => {
    mocks.findClientByEmail.mockResolvedValue(makeClient());
    mocks.bcryptCompare.mockResolvedValue(false);

    await expect(
      authService.clientLogin({ email: 'juan@rentx.com', contrasena: 'wrong' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials' });

    expect(mocks.storeRefreshToken).not.toHaveBeenCalled();
  });
});

describe('AuthService.clientRegister', () => {
  it('rechaza (400) si el email ya existe y no hashea', async () => {
    mocks.emailExists.mockResolvedValue(true);

    await expect(authService.clientRegister(registerInput)).rejects.toMatchObject({
      statusCode: 400,
      message: 'Email already registered',
    });

    expect(mocks.bcryptHash).not.toHaveBeenCalled();
    expect(mocks.insertClient).not.toHaveBeenCalled();
  });

  it('hashea el password antes de guardar y guarda el hash, no el texto plano', async () => {
    mocks.emailExists.mockResolvedValue(false);
    mocks.bcryptHash.mockResolvedValue('$2a$10$hashed-output');
    mocks.insertClient.mockResolvedValue(makeClient());
    mockTokens();

    await authService.clientRegister(registerInput);

    expect(mocks.bcryptHash).toHaveBeenCalledWith('plain-123', 10);
    expect(mocks.insertClient).toHaveBeenCalledWith(
      expect.objectContaining({ contrasena: '$2a$10$hashed-output' })
    );
    expect(mocks.insertClient).not.toHaveBeenCalledWith(
      expect.objectContaining({ contrasena: 'plain-123' })
    );
  });

  it('aplica normalizeIdentifier a numero_licencia antes de usarlo como id_cliente', async () => {
    mocks.emailExists.mockResolvedValue(false);
    mocks.bcryptHash.mockResolvedValue('$2a$10$hashed-output');
    mocks.insertClient.mockResolvedValue(makeClient());
    mockTokens();

    await authService.clientRegister(registerInput);

    expect(mocks.insertClient).toHaveBeenCalledWith(
      expect.objectContaining({
        id_cliente: 'aaa-123',
        numero_licencia: 'aaa-123',
      })
    );
  });
});

describe('AuthService.getCurrentUser', () => {
  it('devuelve los datos del admin (sin hash) cuando el payload es admin activo', async () => {
    const admin = makeAdmin();
    mocks.findAdminById.mockResolvedValue(admin);

    const result = await authService.getCurrentUser({ id: 'admin-1', rol: 'admin' });

    expect(mocks.findAdminById).toHaveBeenCalledWith('admin-1');
    expect(mocks.findClientById).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: 'admin-1',
      nombre: 'Admin Uno',
      email: 'admin@rentx.com',
      rol: 'admin',
    });
  });

  it('devuelve el nombre completo del cliente cuando el payload es client', async () => {
    const client = makeClient();
    mocks.findClientById.mockResolvedValue(client);

    const result = await authService.getCurrentUser({ id: 'aaa-123', rol: 'client' });

    expect(mocks.findClientById).toHaveBeenCalledWith('aaa-123');
    expect(mocks.findAdminById).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: 'aaa-123',
      nombre: 'Juan Perez',
      email: 'juan@rentx.com',
      rol: 'client',
    });
  });

  it('rechaza (404) si el admin ya no existe', async () => {
    mocks.findAdminById.mockResolvedValue(null);

    await expect(
      authService.getCurrentUser({ id: 'ghost', rol: 'admin' })
    ).rejects.toMatchObject({ statusCode: 404, message: 'User not found' });
  });

  it('rechaza (401) si el admin está inactivo', async () => {
    mocks.findAdminById.mockResolvedValue(makeAdmin({ estado: 'inactivo' }));

    await expect(
      authService.getCurrentUser({ id: 'admin-1', rol: 'admin' })
    ).rejects.toMatchObject({ statusCode: 401, message: 'User is inactive' });
  });

  it('rechaza (404) si el cliente ya no existe', async () => {
    mocks.findClientById.mockResolvedValue(null);

    await expect(
      authService.getCurrentUser({ id: 'ghost', rol: 'client' })
    ).rejects.toMatchObject({ statusCode: 404, message: 'User not found' });
  });
});

describe('AuthService.logout', () => {
  it('no lanza si no hay refreshToken', async () => {
    await expect(
      authService.logout(undefined, 'admin-1', 'admin')
    ).resolves.toBeUndefined();
  });
});

describe('AuthService.refreshToken', () => {
  it('rechaza (401) si no se provee refreshToken', async () => {
    await expect(authService.refreshToken(undefined)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Refresh token not provided',
    });
  });

  it('rechaza (401) si jwt.verify lanza (token inválido/expirado)', async () => {
    mocks.jwtVerify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    await expect(authService.refreshToken('bad-token')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid or expired refresh token',
    });
  });

  it('rechaza (401) si el token no está en refresh_tokens', async () => {
    mocks.jwtVerify.mockReturnValue({ id: 'admin-1', rol: 'admin' });
    mocks.findRefreshToken.mockResolvedValue(null);

    await expect(authService.refreshToken('stale-token')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Refresh token not found or revoked',
    });

    expect(mocks.findRefreshToken).toHaveBeenCalledWith('stale-token', 'admin-1', 'admin');
  });

  it('rechaza (401) si el token está expirado y lo elimina', async () => {
    mocks.jwtVerify.mockReturnValue({ id: 'admin-1', rol: 'admin' });
    mocks.findRefreshToken.mockResolvedValue(
      makeRefreshRow({ expires_at: new Date(Date.now() - 3_600_000).toISOString() })
    );

    await expect(authService.refreshToken('expired-token')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Refresh token expired',
    });

    expect(mocks.deleteRefreshToken).toHaveBeenCalledWith('expired-token');
  });

  it('rota el token: borra el viejo, genera uno nuevo y lo guarda', async () => {
    mocks.jwtVerify.mockReturnValue({ id: 'admin-1', rol: 'admin' });
    mocks.findRefreshToken.mockResolvedValue(makeRefreshRow());
    mockTokens();

    const result = await authService.refreshToken('old-token');

    expect(mocks.deleteRefreshToken).toHaveBeenCalledWith('old-token');
    expect(mocks.storeRefreshToken).toHaveBeenCalledWith(
      'admin-1',
      'refresh-token',
      'admin',
      expect.any(String)
    );
    expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
  });
});