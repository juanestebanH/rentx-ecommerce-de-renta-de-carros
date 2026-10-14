import { useMutation, useQuery } from '@tanstack/react-query';
import {
  checkAvailability,
  getCategorias,
  getMarcas,
  getVehicleById,
  getVehicles,
} from '../api/vehicles.api';
import type {
  CatalogDates,
  CheckAvailabilityParams,
  VehicleFilters,
} from '../types/vehicle.types';

export function useVehicles(filters?: VehicleFilters) {
  const key = filters ?? null;
  return useQuery({
    queryKey: ['vehicles', key],
    queryFn: () => getVehicles(key ?? undefined),
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: ({ queryKey }) => getVehicleById(queryKey[1] as string),
    enabled: Boolean(id),
  });
}

export function useMarcas() {
  return useQuery({
    queryKey: ['catalog', 'marcas'],
    queryFn: getMarcas,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['catalog', 'categorias'],
    queryFn: getCategorias,
  });
}

export function useCheckAvailability() {
  return useMutation({
    mutationFn: (params: CheckAvailabilityParams) =>
      checkAvailability(params.id_carro, params.fecha_inicio, params.fecha_fin),
  });
}

export function useVehicleAvailability(
  id: string | undefined,
  dates: CatalogDates,
) {
  const fechaInicio = dates.fecha_inicio;
  const fechaFin = dates.fecha_fin;
  const datesValid =
    Boolean(fechaInicio) &&
    Boolean(fechaFin) &&
    fechaInicio !== undefined &&
    fechaFin !== undefined &&
    fechaInicio <= fechaFin;

  return useQuery({
    queryKey: ['vehicle-availability', id, fechaInicio, fechaFin],
    queryFn: () =>
      checkAvailability(id as string, fechaInicio as string, fechaFin as string),
    enabled: Boolean(id) && datesValid,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}