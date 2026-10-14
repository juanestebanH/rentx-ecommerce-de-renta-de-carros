import { AppError } from '../../shared/utils/AppError.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import { vehiclesRepository } from '../vehicles/vehicles.repository.js';
import { rentalsRepository } from './rentals.repository.js';
import type {
  CheckAvailabilityInput,
  CreateRentaInput,
  Renta,
  RentaEstado,
  RentaFilter,
} from './rentals.types.js';

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface RentaRequester {
  id: string;
  rol: 'admin' | 'client';
}

export class RentalsService {
  async list(filters: RentaFilter): Promise<Renta[]> {
    const normalized: RentaFilter = { ...filters };

    if (normalized.id_carro) normalized.id_carro = normalizeIdentifier(normalized.id_carro);
    if (normalized.id_cliente) normalized.id_cliente = normalizeIdentifier(normalized.id_cliente);

    return rentalsRepository.list(normalized);
  }

  async myRentals(id_cliente: string): Promise<Renta[]> {
    const idCliente = normalizeIdentifier(id_cliente);
    return rentalsRepository.listByClient(idCliente);
  }

  async findById(id: string, requester?: RentaRequester): Promise<Renta> {
    const renta = await rentalsRepository.findById(id);
    if (!renta) {
      throw new AppError('Renta no encontrada', 404);
    }

    if (requester?.rol === 'client' && renta.id_cliente !== normalizeIdentifier(requester.id)) {
      throw new AppError('No tienes acceso a esta renta', 403);
    }

    return renta;
  }

  async create(input: CreateRentaInput, id_cliente: string): Promise<Renta> {
    if (input.fecha_inicio >= input.fecha_fin) {
      throw new AppError('fecha_inicio debe ser anterior a fecha_fin', 400);
    }

    const today = toDateString(new Date());
    if (input.fecha_inicio < today) {
      throw new AppError('fecha_inicio no puede estar en el pasado', 400);
    }

    const idCarro = normalizeIdentifier(input.id_carro);

    const carro = await vehiclesRepository.findTarifaAndEstado(idCarro);
    if (!carro) {
      throw new AppError('Vehículo no encontrado', 404);
    }

    if (carro.estado === 'mantenimiento') {
      throw new AppError('El vehículo no está disponible (en mantenimiento)', 409);
    }

    if (carro.estado === 'inactivo') {
      throw new AppError('El vehículo no está disponible (inactivo)', 409);
    }

    const conflicts = await rentalsRepository.findConflictingRentals(
      idCarro,
      input.fecha_inicio,
      input.fecha_fin
    );

    if (conflicts.length > 0) {
      throw new AppError('El vehículo no está disponible en esas fechas', 409);
    }

    const inicio = new Date(`${input.fecha_inicio}T00:00:00`);
    const fin = new Date(`${input.fecha_fin}T00:00:00`);
    const diasDuracion = Math.round((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;

    const renta: Renta = {
      id_renta: `RENTA-${Date.now()}`,
      fecha_inicio: input.fecha_inicio,
      fecha_fin: input.fecha_fin,
      fecha_registro: today,
      dias_duracion: diasDuracion,
      estado: 'pendiente',
      id_carro: idCarro,
      id_cliente: normalizeIdentifier(id_cliente),
    };

    return rentalsRepository.create(renta);
  }

  async updateEstado(id: string, estado: RentaEstado): Promise<Renta> {
    const existing = await rentalsRepository.findById(id);
    if (!existing) {
      throw new AppError('Renta no encontrada', 404);
    }

    const updated = await rentalsRepository.updateEstado(id, estado);
    if (!updated) {
      throw new AppError('Error al actualizar el estado de la renta', 500);
    }

    return updated;
  }

  async cancel(id: string, requester?: RentaRequester): Promise<Renta> {
    const renta = await this.findById(id, requester);

    if (renta.estado === 'finalizada') {
      throw new AppError('No se puede cancelar una renta ya finalizada', 400);
    }

    if (requester?.rol === 'client' && renta.estado !== 'pendiente') {
      throw new AppError('Solo se puede cancelar una renta pendiente', 400);
    }

    if (renta.estado === 'cancelada') {
      throw new AppError('La renta ya está cancelada', 400);
    }

    const updated = await rentalsRepository.updateEstado(id, 'cancelada');
    if (!updated) {
      throw new AppError('Error al cancelar la renta', 500);
    }

    return updated;
  }

  async checkAvailability(input: CheckAvailabilityInput): Promise<{ available: boolean }> {
    const idCarro = normalizeIdentifier(input.id_carro);

    const carro = await vehiclesRepository.findTarifaAndEstado(idCarro);
    if (!carro || carro.estado !== 'activo') {
      return { available: false };
    }

    const conflicts = await rentalsRepository.findConflictingRentals(
      idCarro,
      input.fecha_inicio,
      input.fecha_fin
    );

    return { available: conflicts.length === 0 };
  }
}

export const rentalsService = new RentalsService();