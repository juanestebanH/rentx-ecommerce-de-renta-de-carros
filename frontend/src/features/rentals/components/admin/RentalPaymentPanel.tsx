import { Loader2, Wallet } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { PagoEstadoBadge } from '@/features/payments/components/PagoEstadoBadge';
import { METODO_PAGO_LABELS } from '@/features/payments/utils/payment.format';
import type { Payment } from '@/features/payments/types/payment.types';
import { ErrorState } from '@/features/reports/components/ErrorState';
import {
  formatCurrencyCOP,
  formatFechaCorta,
  rentalErrorMensaje,
} from '../../utils/rental.format';
import type { ResumenRenta } from '../../utils/renta.resumen';
import { NuevoPagoForm } from './NuevoPagoForm';

interface RentalPaymentPanelProps {
  resumen: ResumenRenta;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  pagoConfirmandoId: string | null;
  onConfirmarPago: (pago: Payment) => void;
  registrando: boolean;
  onRegistrarPago: (input: {
    metodo_pago: Payment['metodo_pago'];
    total_pago: number;
  }) => Promise<boolean>;
}

export function RentalPaymentPanel({
  resumen,
  isLoading,
  error,
  onRetry,
  pagoConfirmandoId,
  onConfirmarPago,
  registrando,
  onRegistrarPago,
}: RentalPaymentPanelProps) {
  const { pagos, saldo, totalEsperado, pagado, admitePagoNuevo } = resumen;
  // Solo efectivo y transferencia quedan pendientes de confirmar; una tarjeta
  // nace `completado` y, si aun así llega pendiente, no hay nada que hacer a mano.
  const confirmables = new Set(resumen.pagosPorConfirmar.map((pago) => pago.id_pago));

  return (
    <section aria-labelledby="admin-renta-pagos">
      <div className="flex items-baseline justify-between gap-3">
        <h3
          id="admin-renta-pagos"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Pagos
        </h3>
        {totalEsperado !== null && (
          <p className="text-sm tabular-nums">
            <span className="text-muted-foreground">Pagado </span>
            {formatCurrencyCOP(pagado)}
            <span className="text-muted-foreground"> de </span>
            {formatCurrencyCOP(totalEsperado)}
          </p>
        )}
      </div>

      {isLoading ? (
        <ul className="mt-3 space-y-2">
          {Array.from({ length: 2 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-12 w-full rounded-lg" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="mt-3">
          <ErrorState
            message={rentalErrorMensaje(error, 'No se pudieron cargar los pagos.')}
            onRetry={onRetry}
          />
        </div>
      ) : pagos.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="size-4 shrink-0" aria-hidden="true" />
          Todavía no hay pagos registrados en esta renta.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {pagos.map((pago) => (
            <PagoFila
              key={pago.id_pago}
              pago={pago}
              confirmable={confirmables.has(pago.id_pago)}
              confirmando={pagoConfirmandoId === pago.id_pago}
              onConfirmar={() => onConfirmarPago(pago)}
            />
          ))}
        </ul>
      )}

      {totalEsperado !== null && (
        <p className="mt-4 border-t border-border pt-3 text-sm">
          {(saldo ?? 0) > 0 ? (
            <>
              <span className="font-semibold text-amber-800">
                Salda {formatCurrencyCOP(saldo ?? 0)}
              </span>
              <span className="text-muted-foreground">
                {' '}
                por registrar. El backend descuenta del saldo tanto lo
                completado como lo que está por confirmar.
              </span>
            </>
          ) : (
            <span className="font-medium text-accent-foreground">
              La renta está cubierta: no hay saldo pendiente.
            </span>
          )}
        </p>
      )}

      {admitePagoNuevo && saldo !== null && (
        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm font-medium">Registrar un pago</p>
          <NuevoPagoForm
            saldo={saldo}
            registrando={registrando}
            onRegistrar={onRegistrarPago}
          />
        </div>
      )}
    </section>
  );
}

interface PagoFilaProps {
  pago: Payment;
  confirmable: boolean;
  confirmando: boolean;
  onConfirmar: () => void;
}

function PagoFila({ pago, confirmable, confirmando, onConfirmar }: PagoFilaProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium tabular-nums">
          {formatCurrencyCOP(pago.total_pago)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {METODO_PAGO_LABELS[pago.metodo_pago]} · {formatFechaCorta(pago.fecha_pago)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PagoEstadoBadge estado={pago.estado} />
        {confirmable && (
          <Button variant="outline" size="xs" onClick={onConfirmar} disabled={confirmando}>
            {confirmando && <Loader2 className="animate-spin" aria-hidden="true" />}
            Confirmar
          </Button>
        )}
      </div>
    </li>
  );
}
