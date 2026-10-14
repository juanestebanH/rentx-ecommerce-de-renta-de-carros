import { randomUUID } from 'node:crypto';
import { AppError } from '../../shared/utils/AppError.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import { RENTA_ESTADOS_ACTIVOS } from '../rentals/rentals.types.js';
import { rentalsRepository } from '../rentals/rentals.repository.js';
import { vehiclesRepository } from './vehicles.repository.js';
import { VEHICLE_ESTADO_INACTIVO } from './vehicles.types.js';
import type {
  Vehicle,
  VehicleFilter,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleEstado,
  UploadPhotoInput,
} from './vehicles.types.js';

export type VehiclesRequester = { rol: 'admin' | 'client' };

export class VehiclesService {
  async list(filters: VehicleFilter, requester?: VehiclesRequester): Promise<Vehicle[]> {
    const normalized = { ...filters };

    if (normalized.incluirMantenimiento === true && requester?.rol !== 'admin') {
      delete normalized.incluirMantenimiento;
    }

    if (normalized.id_marca) normalized.id_marca = normalizeIdentifier(normalized.id_marca);
    if (normalized.id_categoria) normalized.id_categoria = normalizeIdentifier(normalized.id_categoria);
    if (normalized.transmision) normalized.transmision = normalizeIdentifier(normalized.transmision);
    if (normalized.combustible) normalized.combustible = normalizeIdentifier(normalized.combustible);

    return vehiclesRepository.list(normalized);
  }

  async findById(id: string): Promise<Vehicle | null> {
    return vehiclesRepository.findById(normalizeIdentifier(id));
  }

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    const id_carro = normalizeIdentifier(input.id_carro);
    const existing = await vehiclesRepository.findById(id_carro);
    if (existing) {
      throw new AppError('Ya existe un vehículo con esa placa', 400);
    }

    return vehiclesRepository.create({
      ...input,
      id_carro,
      id_marca: normalizeIdentifier(input.id_marca),
      id_categoria: normalizeIdentifier(input.id_categoria),
      foto: input.foto ?? null,
    });
  }

  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    const normalizedId = normalizeIdentifier(id);
    const existing = await vehiclesRepository.findById(normalizedId);
    if (!existing) {
      throw new AppError('Vehículo no encontrado', 404);
    }

    const normalized: UpdateVehicleInput = { ...input };
    if (normalized.id_marca) normalized.id_marca = normalizeIdentifier(normalized.id_marca);
    if (normalized.id_categoria) normalized.id_categoria = normalizeIdentifier(normalized.id_categoria);

    const updated = await vehiclesRepository.update(normalizedId, normalized);
    if (!updated) {
      throw new AppError('Error al actualizar el vehículo', 500);
    }

    return updated;
  }

  /**
   * Soft delete: marca el vehículo como 'inactivo' en vez de borrar la fila,
   * para no romper el historial de rentas que lo referencian.
   *
   * La foto NO se borra: la fila se conserva y el vehículo puede reactivarse
   * después (ver `updateEstado`).
   */
  async remove(id: string): Promise<Vehicle> {
    const normalizedId = normalizeIdentifier(id);
    const existing = await vehiclesRepository.findById(normalizedId);
    if (!existing) {
      throw new AppError('Vehículo no encontrado', 404);
    }

    await this.assertNoRentasActivas(normalizedId);

    const updated = await vehiclesRepository.deactivate(normalizedId);
    if (!updated) {
      throw new AppError('Error al desactivar el vehículo', 500);
    }

    return updated;
  }

  async updateEstado(id: string, estado: VehicleEstado): Promise<Vehicle> {
    const normalizedId = normalizeIdentifier(id);
    const existing = await vehiclesRepository.findById(normalizedId);
    if (!existing) {
      throw new AppError('Vehículo no encontrado', 404);
    }

    if (estado === VEHICLE_ESTADO_INACTIVO && existing.estado !== VEHICLE_ESTADO_INACTIVO) {
      await this.assertNoRentasActivas(normalizedId);
    }

    const updated = await vehiclesRepository.update(normalizedId, { estado });
    if (!updated) {
      throw new AppError('Error al actualizar el estado del vehículo', 500);
    }

    return updated;
  }

  private async assertNoRentasActivas(id_carro: string): Promise<void> {
    const rentas = await rentalsRepository.list({ id_carro });
    if (rentas.some((renta) => RENTA_ESTADOS_ACTIVOS.includes(renta.estado))) {
      throw new AppError('No se puede desactivar un vehículo con rentas activas', 400);
    }
  }

  async uploadPhoto(file: UploadPhotoInput): Promise<string> {
    const extension = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const name = `${randomUUID()}.${extension}`;

    return vehiclesRepository.uploadPhoto(file, name);
  }
}

export const vehiclesService = new VehiclesService();