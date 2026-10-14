import { AppError } from '../../shared/utils/AppError.js';
import { normalizeIdentifier } from '../../shared/utils/normalize.js';
import { rentalsRepository } from '../rentals/rentals.repository.js';
import { RENTA_ESTADOS_ACTIVOS } from '../rentals/rentals.types.js';
import type { RentaConVehiculo } from '../rentals/rentals.types.js';
import { clientsRepository } from './clients.repository.js';
import type { ClientFilter, ClientPublic, ClienteEstado } from './clients.types.js';

export class ClientsService {
  async list(filters: ClientFilter): Promise<ClientPublic[]> {
    return clientsRepository.list(filters);
  }

  async findById(id: string): Promise<ClientPublic> {
    const client = await clientsRepository.findById(normalizeIdentifier(id));
    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }
    return client;
  }

  async rentalHistory(id: string): Promise<RentaConVehiculo[]> {
    const idCliente = normalizeIdentifier(id);

    const client = await clientsRepository.findById(idCliente);
    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    return rentalsRepository.listByClientWithVehicle(idCliente);
  }

  async updateEstado(id: string, estado: ClienteEstado): Promise<ClientPublic> {
    const idCliente = normalizeIdentifier(id);

    const client = await clientsRepository.findById(idCliente);
    if (!client) {
      throw new AppError('Cliente no encontrado', 404);
    }

    if (estado === 'inactivo') {
      const rentals = await rentalsRepository.listByClient(idCliente);
      const hasActiveRental = rentals.some((rental) =>
        RENTA_ESTADOS_ACTIVOS.includes(rental.estado)
      );

      if (hasActiveRental) {
        throw new AppError('No se puede desactivar un cliente con rentas activas', 400);
      }
    }

    const updated = await clientsRepository.updateEstado(idCliente, estado);
    if (!updated) {
      throw new AppError('Error al actualizar el estado del cliente', 500);
    }

    return updated;
  }
}

export const clientsService = new ClientsService();