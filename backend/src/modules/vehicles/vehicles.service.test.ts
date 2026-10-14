import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vehiclesService } from './vehicles.service.js';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deactivate: vi.fn(),
  hardDelete: vi.fn(),
  uploadPhoto: vi.fn(),
  deletePhoto: vi.fn(),
  rentalsList: vi.fn(),
}));

vi.mock('./vehicles.repository.js', () => ({
  vehiclesRepository: {
    list: mocks.list,
    findById: mocks.findById,
    create: mocks.create,
    update: mocks.update,
    deactivate: mocks.deactivate,
    hardDelete: mocks.hardDelete,
    uploadPhoto: mocks.uploadPhoto,
    deletePhoto: mocks.deletePhoto,
  },
}));

vi.mock('../rentals/rentals.repository.js', () => ({
  rentalsRepository: {
    list: mocks.rentalsList,
  },
}));

const vehicle = {
  id_carro: 'aaa-001',
  nombre: 'Carro',
  ano: 2020,
  id_marca: 'honda',
  id_categoria: 'sedan',
  combustible: 'gasolina',
  capacidad: 5,
  seguro: true,
  transmision: 'automatica',
  tarifa: 500,
  estado: 'activo',
  foto: null,
} as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('VehiclesService.list (incluirMantenimiento)', () => {
  it('sin autenticación ignora incluirMantenimiento=true (filtro por defecto: solo activo)', async () => {
    mocks.list.mockResolvedValue([]);

    await vehiclesService.list({ incluirMantenimiento: true, tarifa_min: 100 });

    expect(mocks.list).toHaveBeenCalledWith({ tarifa_min: 100 });
  });

  it('un cliente autenticado tampoco ve los carros en mantenimiento', async () => {
    mocks.list.mockResolvedValue([]);

    await vehiclesService.list({ incluirMantenimiento: true }, { rol: 'client' });

    expect(mocks.list).toHaveBeenCalledWith({});
  });

  it('un admin autenticado con incluirMantenimiento=true ve todos los estados (incluye inactivos)', async () => {
    mocks.list.mockResolvedValue([]);

    await vehiclesService.list(
      { incluirMantenimiento: true, id_marca: 'Honda', tarifa_min: 100 },
      { rol: 'admin' }
    );

    expect(mocks.list).toHaveBeenCalledWith({
      incluirMantenimiento: true,
      id_marca: 'honda',
      tarifa_min: 100,
    });
  });
});

describe('VehiclesService.remove (soft delete)', () => {
  it('lanza 404 si el vehículo no existe', async () => {
    mocks.findById.mockResolvedValue(null);

    await expect(vehiclesService.remove('AAA-001')).rejects.toThrow('Vehículo no encontrado');

    expect(mocks.deactivate).not.toHaveBeenCalled();
  });

  it('no desactiva un vehículo con rentas activas', async () => {
    mocks.findById.mockResolvedValue({ ...vehicle, id_carro: 'AAA-001' });
    mocks.rentalsList.mockResolvedValue([{ estado: 'en_curso' }]);

    await expect(vehiclesService.remove('AAA-001')).rejects.toThrow(
      'No se puede desactivar un vehículo con rentas activas'
    );

    expect(mocks.rentalsList).toHaveBeenCalledWith({ id_carro: 'aaa-001' });
    expect(mocks.deactivate).not.toHaveBeenCalled();
  });

  it('marca inactivo en vez de borrar si las rentas están canceladas o finalizadas', async () => {
    mocks.findById.mockResolvedValue({
      ...vehicle,
      id_carro: 'AAA-001',
      foto: 'https://storage.example.com/foto.jpg',
    });
    mocks.rentalsList.mockResolvedValue([{ estado: 'finalizada' }, { estado: 'cancelada' }]);
    mocks.deactivate.mockResolvedValue({ ...vehicle, id_carro: 'aaa-001', estado: 'inactivo' });

    const result = await vehiclesService.remove('AAA-001');

    expect(mocks.deactivate).toHaveBeenCalledWith('aaa-001');
    expect(result.estado).toBe('inactivo');
  });

  it('no borra la foto: la fila y su imagen se conservan (soft delete)', async () => {
    mocks.findById.mockResolvedValue({
      ...vehicle,
      id_carro: 'AAA-001',
      foto: 'https://storage.example.com/foto.jpg',
    });
    mocks.rentalsList.mockResolvedValue([]);
    mocks.deactivate.mockResolvedValue({ ...vehicle, id_carro: 'aaa-001', estado: 'inactivo' });

    await vehiclesService.remove('AAA-001');

    expect(mocks.deletePhoto).not.toHaveBeenCalled();
  });
});

describe('VehiclesService.updateEstado', () => {
  it('rechaza pasar a inactivo si hay rentas activas', async () => {
    mocks.findById.mockResolvedValue({ ...vehicle, id_carro: 'AAA-001' });
    mocks.rentalsList.mockResolvedValue([{ estado: 'pendiente' }]);

    await expect(vehiclesService.updateEstado('AAA-001', 'inactivo')).rejects.toThrow(
      'No se puede desactivar un vehículo con rentas activas'
    );

    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('permite reactivar un vehículo inactivo', async () => {
    mocks.findById.mockResolvedValue({ ...vehicle, id_carro: 'AAA-001', estado: 'inactivo' });
    mocks.update.mockResolvedValue({ ...vehicle, id_carro: 'aaa-001', estado: 'activo' });

    const result = await vehiclesService.updateEstado('AAA-001', 'activo');

    expect(mocks.rentalsList).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith('aaa-001', { estado: 'activo' });
    expect(result.estado).toBe('activo');
  });
});