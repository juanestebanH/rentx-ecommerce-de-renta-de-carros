import { useQueries } from '@tanstack/react-query';
import { checkAvailability } from '../api/vehicles.api';
import type { CatalogDates, Vehicle } from '../types/vehicle.types';

export type AvailabilityMap = Record<string, boolean | undefined>;

export function useCatalogAvailability(
  vehicles: Vehicle[] | undefined,
  dates: CatalogDates,
): { isPending: boolean; data: AvailabilityMap | undefined } {
  const ids = (vehicles ?? []).map((vehicle) => vehicle.id_carro);
  const datesValid =
    Boolean(dates.fecha_inicio) &&
    Boolean(dates.fecha_fin) &&
    (dates.fecha_inicio ?? '') <= (dates.fecha_fin ?? '');
  const enabled = datesValid && ids.length > 0;

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: [
        'catalog-availability',
        id,
        dates.fecha_inicio,
        dates.fecha_fin,
      ],
      queryFn: () =>
        checkAvailability(id, dates.fecha_inicio ?? '', dates.fecha_fin ?? ''),
      enabled,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    })),
  });

  const isPending = enabled && queries.some((query) => query.isPending);
  const data: AvailabilityMap | undefined = enabled
    ? Object.fromEntries(
        ids.map((id, index) => [
          id,
          queries[index].isSuccess
            ? Boolean(queries[index].data?.available)
            : undefined,
        ]),
      )
    : undefined;

  return { isPending, data };
}