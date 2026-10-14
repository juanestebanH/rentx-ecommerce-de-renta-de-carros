import { apiClient } from '@/shared/lib/apiClient';
import type { CreateRentaInput, Rental, RentalEstado } from '../types/rental.types';

const BASE = '/api/rentals';

export interface AdminRentalsFilter {
  estado?: RentalEstado;
}

export function getMyRentals(): Promise<Rental[]> {
  return apiClient.get<Rental[]>(`${BASE}/mine`);
}

// El listado de admin solo acepta `estado`, `id_cliente` e `id_carro`: la
// búsqueda por texto y el rango de fechas se resuelven en el cliente.
export function getAdminRentals(filters: AdminRentalsFilter = {}): Promise<Rental[]> {
  const params = new URLSearchParams();
  if (filters.estado) params.set('estado', filters.estado);
  const query = params.toString();
  return apiClient.get<Rental[]>(query ? `${BASE}?${query}` : BASE);
}

export function createRenta(input: CreateRentaInput): Promise<Rental> {
  return apiClient.post<Rental>(BASE, input);
}

export function cancelRental(id: string): Promise<Rental> {
  return apiClient.patch<Rental>(`${BASE}/${id}/cancelar`);
}

export function updateRentalEstado(id: string, estado: Rental['estado']): Promise<Rental> {
  return apiClient.patch<Rental>(`${BASE}/${id}/estado`, { estado });
}
