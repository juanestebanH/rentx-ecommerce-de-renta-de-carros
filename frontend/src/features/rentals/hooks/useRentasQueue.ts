import { useQueries } from '@tanstack/react-query';
import { useAdminVehicles } from '@/features/vehicles/hooks/useAdminVehicles';
import { useClients } from '@/features/clients/hooks/useClients';
import { getPaymentsByRental } from '@/features/payments/api/payments.api';
import { pagosDeRentaKey } from '@/features/payments/hooks/usePayments';
import type { Payment } from '@/features/payments/types/payment.types';
import type { Rental, RentalEstado } from '../types/rental.types';
import { useAdminRentals } from './useRentals';
import { RENTA_ESTADOS_ACTIVOS } from '../utils/rental.acciones';
import { buildResumen, type ResumenRenta } from '../utils/renta.resumen';

export interface ColaRentas {
  resumenes: ResumenRenta[];
  isLoading: boolean;
  isLoadingPagos: boolean;
  error: unknown;
  /** Un pago que no cargó deja el conteo incompleto: hay que decirlo. */
  pagosError: unknown;
  refetch: () => void;
}

/**
 * El backend solo expone los pagos de una renta a la vez
 * (`GET /api/payments/renta/:id`), así que la cola los pide en paralelo. Las
 * rentas `finalizada` y `cancelada` nunca son accionables, así que no
 * gastan una petición.
 */
export function useRentasQueue(estado?: RentalEstado): ColaRentas {
  const rentalsQuery = useAdminRentals(estado);
  const vehiclesQuery = useAdminVehicles();
  const clientsQuery = useClients();

  const rentals = rentalsQuery.data ?? [];
  const idsConPagos = rentals
    .filter((renta) => RENTA_ESTADOS_ACTIVOS.includes(renta.estado))
    .map((renta) => renta.id_renta);

  const pagosQueries = useQueries({
    queries: idsConPagos.map((idRenta) => ({
      queryKey: pagosDeRentaKey(idRenta),
      queryFn: () => getPaymentsByRental(idRenta),
      staleTime: 30_000,
    })),
  });

  const pagosPorRenta = new Map<string, Payment[]>();
  const pagosCargados = new Set<string>();
  let pagosError: unknown = null;
  let isLoadingPagos = false;

  idsConPagos.forEach((idRenta, index) => {
    const query = pagosQueries[index];
    if (!query) return;
    if (query.data) {
      pagosPorRenta.set(idRenta, query.data);
    }
    // El conteo accionable no puede asumir "sin pagos" antes de que la lista
    // llegue: `buildResumen` recibe este flag para no contar esos motivos.
    if (!query.isPending) pagosCargados.add(idRenta);
    if (query.isPending) isLoadingPagos = true;
    if (query.error && !pagosError) pagosError = query.error;
  });

  const vehiculosPorId = new Map(
    (vehiclesQuery.data ?? []).map((vehiculo) => [vehiculo.id_carro, vehiculo]),
  );
  const clientesPorId = new Map(
    (clientsQuery.data ?? []).map((cliente) => [cliente.id_cliente, cliente]),
  );

  const resumenes: ResumenRenta[] = rentals.map((renta: Rental) =>
    buildResumen(
      renta,
      pagosPorRenta.get(renta.id_renta),
      vehiculosPorId.get(renta.id_carro),
      clientesPorId.get(renta.id_cliente),
      pagosCargados.has(renta.id_renta),
    ),
  );

  return {
    resumenes,
    isLoading: rentalsQuery.isPending || vehiclesQuery.isPending || clientsQuery.isPending,
    isLoadingPagos,
    error: rentalsQuery.error ?? vehiclesQuery.error ?? clientsQuery.error,
    pagosError,
    refetch: () => {
      void rentalsQuery.refetch();
      void vehiclesQuery.refetch();
      void clientsQuery.refetch();
    },
  };
}
