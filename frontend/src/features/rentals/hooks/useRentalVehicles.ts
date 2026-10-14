import { useQueries } from '@tanstack/react-query';
import { getVehicleById } from '@/features/vehicles/api/vehicles.api';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';
import type { Rental } from '../types/rental.types';

export function useRentalVehicles(rentals: Rental[] | undefined) {
  const carIds = [...new Set((rentals ?? []).map((rental) => rental.id_carro))];

  const results = useQueries({
    queries: carIds.map((id) => ({
      queryKey: ['vehicles', id],
      queryFn: () => getVehicleById(id),
      enabled: Boolean(id),
      staleTime: 60_000,
    })),
  });

  const vehiclesById = new Map<string, Vehicle>();
  carIds.forEach((id, index) => {
    const vehicle = results[index]?.data;
    if (vehicle) vehiclesById.set(id, vehicle);
  });

  return {
    vehiclesById,
    isPending: results.some((result) => result.isPending),
    isError: results.some((result) => result.isError),
  };
}