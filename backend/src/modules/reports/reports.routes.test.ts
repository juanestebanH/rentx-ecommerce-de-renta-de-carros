import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'net';
import type { Server } from 'http';
import reportsRoutes from './reports.routes.js';
import { errorHandler } from '../../shared/middlewares/errorHandler.js';

const mocks = vi.hoisted(() => ({
  rol: 'admin' as 'admin' | 'client' | null,
  dashboard: vi.fn(),
  rentasRecientes: vi.fn(),
  ingresosMensuales: vi.fn(),
  estadoFlota: vi.fn(),
  resumenPeriodo: vi.fn(),
  ingresosPeriodo: vi.fn(),
  rankingVehiculos: vi.fn(),
  ingresosCategoria: vi.fn(),
}));

vi.mock('../../shared/middlewares/authenticate.js', () => ({
  authenticate: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    if (mocks.rol === null) {
      next();
      return;
    }
    req.user = { id: 'U1', correo: 'admin@rentx.co', rol: mocks.rol } as express.Request['user'];
    next();
  },
}));

vi.mock('./reports.controller.js', () => {
  type Spy = { (req: express.Request): void; mock: { calls: unknown[][] } };
  const responder = (spy: Spy) => (req: express.Request, res: express.Response) => {
    spy(req);
    res.json({ ok: true });
  };

  return {
    reportsController: {
      dashboard: responder(mocks.dashboard),
      rentasRecientes: responder(mocks.rentasRecientes),
      ingresosMensuales: responder(mocks.ingresosMensuales),
      estadoFlota: responder(mocks.estadoFlota),
      resumenPeriodo: responder(mocks.resumenPeriodo),
      ingresosPeriodo: responder(mocks.ingresosPeriodo),
      rankingVehiculos: responder(mocks.rankingVehiculos),
      ingresosCategoria: responder(mocks.ingresosCategoria),
    },
  };
});

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRoutes);
app.use(errorHandler);

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rol = 'admin';
});

const PERIODO = 'desde=2026-03-01&hasta=2026-03-31';

describe('reports.routes — autorización', () => {
  it('deja pasar a un admin autenticado', async () => {
    const res = await fetch(`${baseUrl}/api/reports/resumen-periodo?${PERIODO}`);

    expect(res.status).toBe(200);
    expect(mocks.resumenPeriodo).toHaveBeenCalledTimes(1);
  });

  it.each([
    '/api/reports/dashboard',
    `/api/reports/rentas-recientes`,
    `/api/reports/ingresos-mensuales`,
    '/api/reports/estado-flota',
    `/api/reports/resumen-periodo?${PERIODO}`,
    `/api/reports/ingresos-periodo?${PERIODO}`,
    `/api/reports/ranking-vehiculos?${PERIODO}`,
    `/api/reports/ingresos-categoria?${PERIODO}`,
  ])('responde 403 a un cliente en %s', async (ruta) => {
    mocks.rol = 'client';

    const res = await fetch(`${baseUrl}${ruta}`);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({ message: 'Insufficient permissions' });
  });

  it.each([
    '/api/reports/dashboard',
    `/api/reports/rentas-recientes`,
    `/api/reports/ingresos-mensuales`,
    '/api/reports/estado-flota',
    `/api/reports/resumen-periodo?${PERIODO}`,
    `/api/reports/ingresos-periodo?${PERIODO}`,
    `/api/reports/ranking-vehiculos?${PERIODO}`,
    `/api/reports/ingresos-categoria?${PERIODO}`,
  ])('responde 401 sin token en %s', async (ruta) => {
    mocks.rol = null;

    const res = await fetch(`${baseUrl}${ruta}`);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ message: 'Not authenticated' });
  });
});

describe('reports.routes — validación del periodo', () => {
  it.each([
    `/api/reports/resumen-periodo?${PERIODO}`,
    `/api/reports/ingresos-periodo?${PERIODO}`,
    `/api/reports/ranking-vehiculos?${PERIODO}`,
    `/api/reports/ingresos-categoria?${PERIODO}`,
  ])('rechaza un rango invertido en %s', async (ruta) => {
    const res = await fetch(`${baseUrl}${ruta.replace(PERIODO, 'desde=2026-03-31&hasta=2026-03-01')}`);

    expect(res.status).toBe(400);
    expect(mocks.resumenPeriodo).not.toHaveBeenCalled();
    expect(mocks.ingresosPeriodo).not.toHaveBeenCalled();
    expect(mocks.rankingVehiculos).not.toHaveBeenCalled();
    expect(mocks.ingresosCategoria).not.toHaveBeenCalled();
  });

  it.each([
    `/api/reports/resumen-periodo?${PERIODO}`,
    `/api/reports/ingresos-periodo?${PERIODO}`,
    `/api/reports/ranking-vehiculos?${PERIODO}`,
    `/api/reports/ingresos-categoria?${PERIODO}`,
  ])('rechaza fechas mal formadas en %s', async (ruta) => {
    const res = await fetch(`${baseUrl}${ruta.replace(PERIODO, 'desde=01-03-2026&hasta=31-03-2026')}`);

    expect(res.status).toBe(400);
  });

  it('rechaza un periodo más largo de 366 días', async () => {
    const res = await fetch(
      `${baseUrl}/api/reports/resumen-periodo?desde=2025-01-01&hasta=2026-03-31`
    );

    expect(res.status).toBe(400);
  });

  it('rechaza un agrupar distinto de semana o mes', async () => {
    const res = await fetch(`${baseUrl}/api/reports/ingresos-periodo?${PERIODO}&agrupar=trimestre`);

    expect(res.status).toBe(400);
  });

  it('rechaza un limite fuera de 1..100', async () => {
    await expect(
      fetch(`${baseUrl}/api/reports/ranking-vehiculos?${PERIODO}&limite=0`)
    ).resolves.toMatchObject({ status: 400 });
    await expect(
      fetch(`${baseUrl}/api/reports/ranking-vehiculos?${PERIODO}&limite=101`)
    ).resolves.toMatchObject({ status: 400 });
  });

  it('normaliza el query y entrega el periodo ya parseado al controller', async () => {
    await fetch(`${baseUrl}/api/reports/ranking-vehiculos?${PERIODO}&limite=3`);

    expect(mocks.rankingVehiculos).toHaveBeenCalledTimes(1);
    expect(mocks.rankingVehiculos.mock.calls[0][0].query).toEqual({
      desde: '2026-03-01',
      hasta: '2026-03-31',
      limite: 3,
    });
  });

  it('aplica el limite por defecto cuando no viene en el query', async () => {
    await fetch(`${baseUrl}/api/reports/ranking-vehiculos?${PERIODO}`);

    expect(mocks.rankingVehiculos.mock.calls[0][0].query).toEqual({
      desde: '2026-03-01',
      hasta: '2026-03-31',
      limite: 10,
    });
  });

  it('aplica agrupar=semana por defecto', async () => {
    await fetch(`${baseUrl}/api/reports/ingresos-periodo?${PERIODO}`);

    expect(mocks.ingresosPeriodo.mock.calls[0][0].query).toEqual({
      desde: '2026-03-01',
      hasta: '2026-03-31',
      agrupar: 'semana',
    });
  });

  it('no filtra por periodo en los endpoints existentes sin query', async () => {
    const res = await fetch(`${baseUrl}/api/reports/dashboard`);

    expect(res.status).toBe(200);
    expect(mocks.dashboard).toHaveBeenCalledTimes(1);
  });
});