import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Rental } from '../types/rental.types';
import type { MetodoPago, Payment } from '@/features/payments/types/payment.types';
import {
  pagosDeRentaKey,
  useCreatePayment,
  useUpdatePaymentEstado,
} from '@/features/payments/hooks/usePayments';
import { useCancelRental, useUpdateRentalEstado } from './useRentals';
import { ACCION_META, type AccionRenta } from '../utils/rental.acciones';
import { rentalErrorMensaje } from '../utils/rental.format';
import type { ResumenRenta } from '../utils/renta.resumen';

const RENTALS_ADMIN_KEY = ['rentals', 'admin'] as const;

interface Callbacks {
  onOk?: () => void;
  onError?: (mensaje: string) => void;
}

function patchEstadoEnCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  estado: Rental['estado'],
) {
  queryClient.setQueriesData<Rental[]>({ queryKey: RENTALS_ADMIN_KEY }, (lista) =>
    lista?.map((renta) => (renta.id_renta === id ? { ...renta, estado } : renta)),
  );
}

/**
 * El backend no valida transiciones ni re-evalúa la confirmación automática al
 * cambiar un pago, así que cada mutación revierte de forma optimista lo que
 * escribió en la caché y la deja en manos de la invalidación.
 */
export function useRentaAcciones() {
  const queryClient = useQueryClient();
  const estadoMutation = useUpdateRentalEstado();
  const cancelMutation = useCancelRental();
  const pagoMutation = useUpdatePaymentEstado();
  const crearPagoMutation = useCreatePayment();

  const idRentaPendiente =
    estadoMutation.isPending || cancelMutation.isPending
      ? (estadoMutation.variables?.id ?? cancelMutation.variables ?? null)
      : null;

  const pagoConfirmandoId = pagoMutation.isPending
    ? (pagoMutation.variables?.id ?? null)
    : null;

  const ejecutarEstado = useCallback(
    (accion: AccionRenta, resumen: ResumenRenta, { onOk, onError }: Callbacks = {}) => {
      const id = resumen.renta.id_renta;
      const anterior = resumen.renta.estado;
      const siguiente = ACCION_META[accion].resultado as Rental['estado'];
      const meta = ACCION_META[accion];
      const fallback = `No se pudo ${meta.label.toLowerCase()}. Inténtalo de nuevo.`;

      patchEstadoEnCache(queryClient, id, siguiente);

      const revertir = (error: unknown) => {
        patchEstadoEnCache(queryClient, id, anterior);
        const mensaje = rentalErrorMensaje(error, fallback);
        toast.error(mensaje);
        onError?.(mensaje);
      };

      // Cancelar tiene su propio endpoint: `PATCH /rentals/:id/cancelar` es el
      // que rechaza una renta ya finalizada o cancelada. Nunca `estado:
      // 'cancelada'`, que se saltaría esa validación.
      if (accion === 'cancelar_renta') {
        cancelMutation.mutate(id, {
          onSuccess: () => {
            toast.success(`Renta cancelada · ${resumen.clienteNombre}.`);
            onOk?.();
          },
          onError: revertir,
        });
        return;
      }

      estadoMutation.mutate(
        { id, estado: siguiente },
        {
          onSuccess: () => {
            toast.success(`${meta.label} · ${resumen.clienteNombre}.`);
            onOk?.();
          },
          onError: revertir,
        },
      );
    },
    [cancelMutation, estadoMutation, queryClient],
  );

  const confirmarPago = useCallback(
    (pago: Payment, resumen: ResumenRenta, { onOk, onError }: Callbacks = {}) => {
      const idRenta = pago.id_renta;

      queryClient.setQueryData<Payment[]>(pagosDeRentaKey(idRenta), (lista) =>
        lista?.map((item) =>
          item.id_pago === pago.id_pago ? { ...item, estado: 'completado' } : item,
        ),
      );

      pagoMutation.mutate(
        { id: pago.id_pago, estado: 'completado' },
        {
          onSuccess: () => {
            toast.success(`Pago confirmado · ${resumen.clienteNombre}.`);
            onOk?.();
          },
          onError: (error) => {
            void queryClient.invalidateQueries({ queryKey: pagosDeRentaKey(idRenta) });
            const mensaje = rentalErrorMensaje(
              error,
              'No se pudo confirmar el pago. Inténtalo de nuevo.',
            );
            toast.error(mensaje);
            onError?.(mensaje);
          },
        },
      );
    },
    [pagoMutation, queryClient],
  );

  const registrarPago = useCallback(
    async (
      resumen: ResumenRenta,
      input: { metodo_pago: MetodoPago; total_pago: number },
    ): Promise<boolean> => {
      try {
        await crearPagoMutation.mutateAsync({ id_renta: resumen.renta.id_renta, ...input });
        toast.success(`Pago registrado · ${resumen.clienteNombre}.`);
        return true;
      } catch (error) {
        toast.error(
          rentalErrorMensaje(error, 'No se pudo registrar el pago. Inténtalo de nuevo.'),
        );
        return false;
      }
    },
    [crearPagoMutation],
  );

  return {
    estadoMutation,
    pagoMutation,
    crearPagoMutation,
    idRentaPendiente,
    pagoConfirmandoId,
    ejecutarEstado,
    confirmarPago,
    registrarPago,
  };
}
