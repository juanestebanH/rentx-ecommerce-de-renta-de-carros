import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelRental,
  createRenta,
  getAdminRentals,
  getMyRentals,
  updateRentalEstado,
} from '../api/rentals.api';
import type { CreateRentaInput, RentalEstado } from '../types/rental.types';
import { pagosDeRentaKey } from '@/features/payments/hooks/usePayments';

// Prefijo: `['rentals']` cubre el listado de admin, el del cliente y los pagos
// de cada renta, así que una sola invalidación refresca la cola completa.
const RENTALS_QUERY_KEY = ['rentals'] as const;

function invalidateRentals(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: RENTALS_QUERY_KEY });
}

export function useCreateRenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRentaInput) => createRenta(input),
    onSettled: () => void invalidateRentals(queryClient),
  });
}

export function useMyRentals() {
  return useQuery({
    queryKey: ['rentals', 'mine'],
    queryFn: getMyRentals,
  });
}

export function useAdminRentals(estado?: RentalEstado) {
  return useQuery({
    queryKey: ['rentals', 'admin', estado ?? 'todos'],
    queryFn: () => getAdminRentals(estado ? { estado } : {}),
    placeholderData: (previo) => previo,
  });
}

export function useCancelRental() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelRental(id),
    onSettled: () => void invalidateRentals(queryClient),
  });
}

export function useUpdateRentalEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: RentalEstado }) =>
      updateRentalEstado(id, estado),
    onSettled: (_data, _error, variables) => {
      void invalidateRentals(queryClient);
      void queryClient.invalidateQueries({
        queryKey: pagosDeRentaKey(variables.id),
      });
    },
  });
}
