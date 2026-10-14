import { describe, it, expect, beforeEach, vi } from 'vitest';
import { paymentsService } from './payments.service.js';
import type { Pago } from './payments.types.js';
import type { Renta } from '../rentals/rentals.types.js';

const mocks = vi.hoisted(() => ({
  // payments
  findByIdPago: vi.fn(),
  listByRenta: vi.fn(),
  create: vi.fn(),
  updateEstadoPago: vi.fn(),
  sumByRentaAndEstado: vi.fn(),
  // rentals (reusados por payments)
  findByIdRenta: vi.fn(),
  updateEstadoRenta: vi.fn(),
  // vehicles
  findTarifaAndEstado: vi.fn(),
}));

vi.mock('./payments.repository.js', () => ({
  paymentsRepository: {
    findById: mocks.findByIdPago,
    listByRenta: mocks.listByRenta,
    create: mocks.create,
    updateEstado: mocks.updateEstadoPago,
    sumByRentaAndEstado: mocks.sumByRentaAndEstado,
  },
}));

vi.mock('../rentals/rentals.repository.js', () => ({
  rentalsRepository: {
    findById: mocks.findByIdRenta,
    updateEstado: mocks.updateEstadoRenta,
  },
}));

vi.mock('../vehicles/vehicles.repository.js', () => ({
  vehiclesRepository: {
    findTarifaAndEstado: mocks.findTarifaAndEstado,
  },
}));

const validInput = {
  id_renta: 'RENTA-123',
  metodo_pago: 'tarjeta' as const,
  total_pago: 100,
};

function makeRenta(overrides: Partial<Renta> = {}): Renta {
  return {
    id_renta: 'RENTA-123',
    fecha_inicio: '2027-01-10',
    fecha_fin: '2027-01-11',
    fecha_registro: '2026-09-12',
    dias_duracion: 2,
    estado: 'pendiente',
    id_carro: 'aaa-420',
    id_cliente: 'lic-001',
    ...overrides,
  };
}

function makePago(overrides: Partial<Pago> = {}): Pago {
  return {
    id_pago: 'PAGO-1',
    id_renta: 'RENTA-123',
    metodo_pago: 'tarjeta',
    total_pago: 100,
    fecha_pago: '2026-09-12',
    estado: 'completado',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PaymentsService.create', () => {
  it('registra el pago (abono parcial) sin cambiar el estado de la renta', async () => {
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockImplementation(async (_id, estados) =>
      estados.includes('pendiente') ? 0 : 100
    );
    mocks.create.mockImplementation(async (pago: Pago) => pago);

    const result = await paymentsService.create(validInput);

    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_renta: 'RENTA-123', total_pago: 100, estado: 'completado' })
    );
    expect(result.estado).toBe('completado');
    expect(result.id_pago).toMatch(/^PAGO-/);
    expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
  });

  it('tarjeta nace "completado" y confirma la renta cuando completa el total', async () => {
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockImplementation(async (_id, estados) =>
      estados.includes('pendiente') ? 0 : 1000
    );
    mocks.create.mockImplementation(async (pago: Pago) => pago);

    const result = await paymentsService.create({ ...validInput, metodo_pago: 'tarjeta', total_pago: 1000 });

    expect(result.estado).toBe('completado');
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_renta: 'RENTA-123', total_pago: 1000, estado: 'completado' })
    );
    expect(mocks.sumByRentaAndEstado).toHaveBeenCalledWith('RENTA-123', ['completado']);
    expect(mocks.updateEstadoRenta).toHaveBeenCalledWith('RENTA-123', 'confirmada');
  });

  it.each([
    { metodoPago: 'tarjeta', esperado: 'completado' },
    { metodoPago: 'efectivo', esperado: 'pendiente' },
    { metodoPago: 'transferencia', esperado: 'pendiente' },
  ] as const)('un pago con metodo_pago "$metodoPago" nace en estado "$esperado"', async ({ metodoPago, esperado }) => {
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockResolvedValue(0);
    mocks.create.mockImplementation(async (pago: Pago) => pago);

    const result = await paymentsService.create({ ...validInput, metodo_pago: metodoPago });

    expect(result.estado).toBe(esperado);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ estado: esperado })
    );
    expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
  });

  it('efectivo que completa el total NO confirma la renta (queda pendiente hasta PATCH admin)', async () => {
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockImplementation(async (_id, estados) =>
      estados.includes('pendiente') ? 0 : 0
    );
    mocks.create.mockImplementation(async (pago: Pago) => pago);

    const result = await paymentsService.create({ ...validInput, metodo_pago: 'efectivo', total_pago: 1000 });

    expect(result.estado).toBe('pendiente');
    expect(mocks.sumByRentaAndEstado).toHaveBeenCalledWith('RENTA-123', ['completado']);
    expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
  });

  it('ignora un campo "estado" explícito en el input (depende solo de metodo_pago)', async () => {
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockResolvedValue(0);
    mocks.create.mockImplementation(async (pago: Pago) => pago);

    const input = {
      ...validInput,
      metodo_pago: 'efectivo',
      estado: 'completado',
    } as const;

    const result = await paymentsService.create(input as never);

    expect(result.estado).toBe('pendiente');
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'pendiente' })
    );
    expect(mocks.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'completado' })
    );
  });

  it('rechaza (400) si total_pago excede el saldo pendiente e incluye el monto restante', async () => {
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockImplementation(async (_id, estados) =>
      estados.includes('pendiente') ? 0 : 0
    );

    await expect(paymentsService.create({ ...validInput, total_pago: 1200 })).rejects.toThrow(
      'El monto excede el saldo pendiente de la renta ($1000 restante)'
    );

    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
  });

  it.each(['cancelada', 'finalizada'] as const)(
    'rechaza (400) si la renta asociada tiene estado "%s"',
    async (estado) => {
      mocks.findByIdRenta.mockResolvedValue(makeRenta({ estado }));

      await expect(paymentsService.create(validInput)).rejects.toThrow(
        'No se puede registrar un pago para esta renta'
      );

      expect(mocks.create).not.toHaveBeenCalled();
      expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
    }
  );

  it('un pago pendiente existente cuenta contra el saldo (la confirmación solo suma "completado")', async () => {
    // Renta total 1000. Saldo: 1000 - (70 completado + 30 pendiente) = 900 restante.
    mocks.findByIdRenta.mockResolvedValue(makeRenta());
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.sumByRentaAndEstado.mockImplementation(async (_id, estados) =>
      estados.includes('pendiente') ? 100 : 0
    );

    await expect(paymentsService.create({ ...validInput, total_pago: 950 })).rejects.toThrow(
      'El monto excede el saldo pendiente de la renta ($900 restante)'
    );

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('no sobreescribe el estado si la renta ya está confirmada/en_curso aunque se complete el total', async () => {
    for (const estado of ['confirmada', 'en_curso'] as const) {
      vi.clearAllMocks();
      mocks.findByIdRenta.mockResolvedValue(makeRenta({ estado }));
      mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
      mocks.sumByRentaAndEstado.mockImplementation(async (_id, estados) =>
        estados.includes('pendiente') ? 0 : 1000
      );
      mocks.create.mockImplementation(async (pago: Pago) => pago);

      await paymentsService.create({ ...validInput, total_pago: 1000 });

      expect(mocks.create).toHaveBeenCalled();
      expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
    }
  });
});

describe('PaymentsService.updateEstado', () => {
  it('marcar un pago como "reembolsado" no revierte el estado de la renta', async () => {
    mocks.findByIdPago.mockResolvedValue(makePago());
    mocks.updateEstadoPago.mockResolvedValue(makePago({ estado: 'reembolsado' }));

    const result = await paymentsService.updateEstado('PAGO-1', 'reembolsado');

    expect(mocks.updateEstadoPago).toHaveBeenCalledWith('PAGO-1', 'reembolsado');
    expect(result.estado).toBe('reembolsado');
    expect(mocks.findByIdRenta).not.toHaveBeenCalled();
    expect(mocks.updateEstadoRenta).not.toHaveBeenCalled();
  });

  it('rechaza (404) si el pago no existe', async () => {
    mocks.findByIdPago.mockResolvedValue(null);

    await expect(paymentsService.updateEstado('PAGO-999', 'reembolsado')).rejects.toThrow(
      'Pago no encontrado'
    );

    expect(mocks.updateEstadoPago).not.toHaveBeenCalled();
  });
});