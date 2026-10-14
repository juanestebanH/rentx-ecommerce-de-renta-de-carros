import { apiClient } from '@/shared/lib/apiClient';
import type { RentalConVehiculo } from '@/features/rentals/types/rental.types';
import type { Client, ClienteEstado } from '../types/clients.types';

const BASE = '/api/clients';

export function getClients(estado?: ClienteEstado): Promise<Client[]> {
  return apiClient.get<Client[]>(
    `${BASE}${estado ? `?estado=${estado}` : ''}`,
  );
}

export function getClientRentals(id: string): Promise<RentalConVehiculo[]> {
  return apiClient.get<RentalConVehiculo[]>(`${BASE}/${id}/rentals`);
}

export function updateClienteEstado(
  id: string,
  estado: ClienteEstado,
): Promise<Client> {
  return apiClient.patch<Client>(`${BASE}/${id}/estado`, { estado });
}