import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPayment, getPaymentsByRental, updatePaymentEstado } from '../api/payments.api';
import type { CreatePaymentInput, PagoEstado } from '../types/payment.types';

// Prefijo: las mutaciones de pagos invalidan toda la cola de rentas, porque
// el resumen de cada fila (pagado, saldo, motivo) se deriva de sus pagos.
const RENTALS_QUERY_KEY = ['rentals'] as const;

export function pagosDeRentaKey(idRenta: string) {
  return ['rentals', idRenta, 'pagos'] as const;
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePaymentInput) => createPayment(input),
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: RENTALS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: pagosDeRentaKey(variables.id_renta),
      });
    },
  });
}

export function usePaymentsByRental(idRenta: string | null) {
  return useQuery({
    queryKey: pagosDeRentaKey(idRenta ?? ''),
    queryFn: () => getPaymentsByRental(idRenta ?? ''),
    enabled: Boolean(idRenta),
  });
}

export function useUpdatePaymentEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: PagoEstado }) =>
      updatePaymentEstado(id, estado),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: RENTALS_QUERY_KEY });
    },
  });
}
