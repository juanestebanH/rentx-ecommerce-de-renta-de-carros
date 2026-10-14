import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rentalsService } from './rentals.service.js';
import type { Renta } from './rentals.types.js';

const mocks = vi.hoisted(() => ({
  findById: vi.fn(),
  listByClient: vi.fn(),
  list: vi.fn(),
  updateEstado: vi.fn(),
  create: vi.fn(),
  findConflictingRentals: vi.fn(),
  findTarifaAndEstado: vi.fn(),
}));

vi.mock('./rentals.repository.js', () => ({
  rentalsRepository: {
    findById: mocks.findById,
    listByClient: mocks.listByClient,
    list: mocks.list,
    updateEstado: mocks.updateEstado,
    create: mocks.create,
    findConflictingRentals: mocks.findConflictingRentals,
  },
}));

vi.mock('../vehicles/vehicles.repository.js', () => ({
  vehiclesRepository: {
    findTarifaAndEstado: mocks.findTarifaAndEstado,
  },
}));

const validInput = {
  fecha_inicio: '2027-01-10',
  fecha_fin: '2027-01-14',
  id_carro: 'AAA-420',
};

function makeRenta(overrides: Partial<Renta> = {}): Renta {
  return {
    id_renta: 'RENTA-123',
    fecha_inicio: '2027-01-10',
    fecha_fin: '2027-01-14',
    fecha_registro: '2026-09-12',
    dias_duracion: 5,
    estado: 'pendiente',
    id_carro: 'aaa-420',
    id_cliente: 'lic-001',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RentalsService.create', () => {
  it('crea la renta exitosamente cuando no hay traslape y el carro no está en mantenimiento', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.findConflictingRentals.mockResolvedValue([]);
    mocks.create.mockImplementation(async (renta: Renta) => renta);

    const result = await rentalsService.create(validInput, 'LIC-001');

    expect(mocks.findTarifaAndEstado).toHaveBeenCalledWith('aaa-420');
    expect(mocks.findConflictingRentals).toHaveBeenCalledWith(
      'aaa-420',
      '2027-01-10',
      '2027-01-14'
    );
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(result.id_carro).toBe('aaa-420');
    expect(result.id_cliente).toBe('lic-001');
    expect(result.estado).toBe('pendiente');
    expect(result.id_renta).toMatch(/^RENTA-/);
  });

  it.each([
    { fecha_inicio: '2027-01-14', fecha_fin: '2027-01-10', name: 'fecha_inicio posterior a fecha_fin' },
    { fecha_inicio: '2027-01-10', fecha_fin: '2027-01-10', name: 'fecha_inicio igual a fecha_fin' },
  ])('rechaza si $name', async ({ fecha_inicio, fecha_fin }) => {
    await expect(
      rentalsService.create({ ...validInput, fecha_inicio, fecha_fin }, 'LIC-001')
    ).rejects.toThrow('fecha_inicio debe ser anterior a fecha_fin');

    expect(mocks.findTarifaAndEstado).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rechaza si fecha_inicio está en el pasado', async () => {
    await expect(
      rentalsService.create({ ...validInput, fecha_inicio: '2020-01-01', fecha_fin: '2020-01-05' }, 'LIC-001')
    ).rejects.toThrow('fecha_inicio no puede estar en el pasado');

    expect(mocks.findTarifaAndEstado).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rechaza (409) si el carro tiene estado "mantenimiento"', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'mantenimiento' });

    await expect(rentalsService.create(validInput, 'LIC-001')).rejects.toThrow(
      'El vehículo no está disponible (en mantenimiento)'
    );

    expect(mocks.findConflictingRentals).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rechaza (409) si el carro tiene estado "inactivo"', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'inactivo' });

    await expect(rentalsService.create(validInput, 'LIC-001')).rejects.toThrow(
      'El vehículo no está disponible (inactivo)'
    );

    expect(mocks.findConflictingRentals).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rechaza (409) si findConflictingRentals devuelve al menos una renta conflictiva', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.findConflictingRentals.mockResolvedValue([makeRenta()]);

    await expect(rentalsService.create(validInput, 'LIC-001')).rejects.toThrow(
      'El vehículo no está disponible en esas fechas'
    );

    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('calcula dias_duracion correctamente (criterio inclusivo: +1 día, rango de 5 días → 5)', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.findConflictingRentals.mockResolvedValue([]);
    mocks.create.mockImplementation(async (renta: Renta) => renta);

    const result = await rentalsService.create(validInput, 'LIC-001');

    expect(result.dias_duracion).toBe(5);
    expect(result.dias_duracion).toBe(
      Math.round((Date.UTC(2027, 0, 14) - Date.UTC(2027, 0, 10)) / 86_400_000) + 1
    );
  });
});

describe('RentalsService.cancel', () => {
  it('permite cancelar si estado es "pendiente"', async () => {
    const target = makeRenta();
    const cancelled = makeRenta({ estado: 'cancelada' });
    mocks.findById.mockResolvedValue(target);
    mocks.updateEstado.mockResolvedValue(cancelled);

    const result = await rentalsService.cancel('RENTA-123');

    expect(mocks.findById).toHaveBeenCalledWith('RENTA-123');
    expect(mocks.updateEstado).toHaveBeenCalledWith('RENTA-123', 'cancelada');
    expect(result.estado).toBe('cancelada');
  });

  it('rechaza que un client cancele una renta "en_curso"', async () => {
    const requester = { id: 'LIC-001', rol: 'client' as const };
    mocks.findById.mockResolvedValue(makeRenta({ estado: 'en_curso' }));

    await expect(rentalsService.cancel('RENTA-123', requester)).rejects.toThrow(
      'Solo se puede cancelar una renta pendiente'
    );

    expect(mocks.updateEstado).not.toHaveBeenCalled();
  });

  it('rechaza cancelar si estado es "finalizada" incluso siendo admin', async () => {
    const requester = { id: 'admin-1', rol: 'admin' as const };
    mocks.findById.mockResolvedValue(makeRenta({ estado: 'finalizada' }));

    await expect(rentalsService.cancel('RENTA-123', requester)).rejects.toThrow(
      'No se puede cancelar una renta ya finalizada'
    );

    expect(mocks.updateEstado).not.toHaveBeenCalled();
  });

  it('permite que un admin cancele una renta "en_curso"', async () => {
    const requester = { id: 'admin-1', rol: 'admin' as const };
    const cancelled = makeRenta({ estado: 'cancelada' });
    mocks.findById.mockResolvedValue(makeRenta({ estado: 'en_curso' }));
    mocks.updateEstado.mockResolvedValue(cancelled);

    const result = await rentalsService.cancel('RENTA-123', requester);

    expect(mocks.updateEstado).toHaveBeenCalledWith('RENTA-123', 'cancelada');
    expect(result.estado).toBe('cancelada');
  });
});

describe('RentalsService.checkAvailability', () => {
  it('no está disponible si el carro está en mantenimiento', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'mantenimiento' });

    await expect(
      rentalsService.checkAvailability(validInput)
    ).resolves.toEqual({ available: false });

    expect(mocks.findConflictingRentals).not.toHaveBeenCalled();
  });

  it('no está disponible si el carro está inactivo', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'inactivo' });

    await expect(
      rentalsService.checkAvailability(validInput)
    ).resolves.toEqual({ available: false });

    expect(mocks.findConflictingRentals).not.toHaveBeenCalled();
  });

  it('está disponible si el carro está activo y no hay traslape', async () => {
    mocks.findTarifaAndEstado.mockResolvedValue({ tarifa: 500, estado: 'activo' });
    mocks.findConflictingRentals.mockResolvedValue([]);

    await expect(
      rentalsService.checkAvailability(validInput)
    ).resolves.toEqual({ available: true });
  });
});