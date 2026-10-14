import { apiClient } from '@/shared/lib/apiClient';
import type {
  CheckAvailabilityParams,
  Vehicle,
  VehicleEstado,
  VehicleFilters,
} from '../types/vehicle.types';

const BASE = '/api/vehicles';

export function getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const params = new URLSearchParams();

  if (filters.id_categoria) params.set('id_categoria', filters.id_categoria);
  if (filters.id_marca) params.set('id_marca', filters.id_marca);
  if (filters.transmision) params.set('transmision', filters.transmision);
  if (filters.combustible) params.set('combustible', filters.combustible);
  if (filters.tarifa_min !== undefined) {
    params.set('tarifa_min', String(filters.tarifa_min));
  }
  if (filters.tarifa_max !== undefined) {
    params.set('tarifa_max', String(filters.tarifa_max));
  }
  if (filters.incluirMantenimiento) {
    params.set('incluirMantenimiento', 'true');
  }

  const query = params.toString();
  return apiClient.get<Vehicle[]>(`${BASE}${query ? `?${query}` : ''}`);
}

export function getVehicleById(id: string): Promise<Vehicle> {
  return apiClient.get<Vehicle>(`${BASE}/${id}`);
}

export function createVehicle(input: Vehicle): Promise<Vehicle> {
  return apiClient.post<Vehicle>(BASE, input);
}

export function updateVehicle(
  id: string,
  input: Omit<Vehicle, 'id_carro'>,
): Promise<Vehicle> {
  return apiClient.put<Vehicle>(`${BASE}/${id}`, input);
}

export function deleteVehicle(id: string): Promise<void> {
  return apiClient.delete<void>(`${BASE}/${id}`);
}

export function updateVehicleEstado(
  id: string,
  estado: VehicleEstado,
): Promise<Vehicle> {
  return apiClient.patch<Vehicle>(`${BASE}/${id}/estado`, { estado });
}

export function uploadVehiclePhoto(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('photo', file);
  return apiClient.post<{ url: string }>(`${BASE}/upload-photo`, form);
}

export function checkAvailability(
  id_carro: string,
  fecha_inicio: string,
  fecha_fin: string,
): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ id_carro, fecha_inicio, fecha_fin });
  return apiClient.get<{ available: boolean }>(
    `/api/rentals/check-availability?${params.toString()}`,
  );
}

export type { CheckAvailabilityParams };

export interface CatalogEntry {
  nombre: string;
}

export function getMarcas(): Promise<CatalogEntry[]> {
  return apiClient.get<CatalogEntry[]>('/api/catalog/marcas');
}

export function getCategorias(): Promise<CatalogEntry[]> {
  return apiClient.get<CatalogEntry[]>('/api/catalog/categorias');
}