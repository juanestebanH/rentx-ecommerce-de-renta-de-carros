import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ApiError } from '@/shared/lib/apiClient';
import { ReservationBreakdown } from '@/features/vehicles/components/ReservationBreakdown';
import { rentalErrorMensaje } from '@/features/rentals/utils/rental.format';
import { METODO_PAGO_LABELS } from '@/features/payments/utils/payment.format';
import type { MetodoPago } from '@/features/payments/types/payment.types';
import type { Rental } from '@/features/rentals/types/rental.types';
import type { ReservationStage } from '@/features/rentals/hooks/useReservationFlow';

interface ReservationSummaryCardProps {
  tarifa: number;
  days: number;
  metodoPago: MetodoPago | null;
  canConfirm: boolean;
  isRunning: boolean;
  stage: ReservationStage;
  detalleHref: string;
  onConfirm: () => void;
  onReintentarPago: (renta: Rental) => void;
}

function confirmLabel(stage: ReservationStage): string {
  if (stage.kind === 'creando-renta') return 'Creando reserva…';
  if (stage.kind === 'registrando-pago') return 'Registrando pago…';
  return 'Confirmar reserva';
}

function errorStatus(error: unknown): number {
  return error instanceof ApiError ? error.status : 500;
}

function BookingError({
  stage,
  detalleHref,
  onReintentarPago,
  onConfirm,
}: {
  stage: ReservationStage;
  detalleHref: string;
  onReintentarPago: (renta: Rental) => void;
  onConfirm: () => void;
}) {
  if (stage.kind !== 'renta-error' && stage.kind !== 'pago-error') return null;

  const status = errorStatus(stage.error);
  const mensaje = rentalErrorMensaje(
    stage.error,
    stage.kind === 'renta-error'
      ? 'No se pudo crear la reserva.'
      : 'No se pudo registrar el pago.',
  );

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3"
    >
      <p className="text-sm font-medium text-destructive">{mensaje}</p>
      {stage.kind === 'pago-error' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onReintentarPago(stage.renta)}
          >
            Reintentar pago
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/mis-rentas">Ver mis rentas</Link>
          </Button>
        </div>
      ) : status === 400 || status === 409 ? (
        <Button asChild variant="outline" size="sm">
          <Link to={detalleHref}>Volver al carro</Link>
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={onConfirm}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function ReservationSummaryCard({
  tarifa,
  days,
  metodoPago,
  canConfirm,
  isRunning,
  stage,
  detalleHref,
  onConfirm,
  onReintentarPago,
}: ReservationSummaryCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5 lg:sticky lg:top-6">
        <div>
          <h2 className="my-0 text-lg font-semibold tracking-tight">Resumen</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Al confirmar se crea la renta y se registra el pago.
          </p>
        </div>

        <ReservationBreakdown tarifa={tarifa} days={days} />

        <dl className="flex items-center justify-between gap-3 border-y border-border py-2.5 text-sm">
          <dt className="text-muted-foreground">Método de pago</dt>
          <dd
            className={
              metodoPago ? 'font-medium' : 'text-muted-foreground'
            }
          >
            {metodoPago ? METODO_PAGO_LABELS[metodoPago] : 'Por elegir'}
          </dd>
        </dl>

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          {isRunning && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          {confirmLabel(stage)}
        </Button>

        <BookingError
          stage={stage}
          detalleHref={detalleHref}
          onReintentarPago={onReintentarPago}
          onConfirm={onConfirm}
        />
      </Card>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Es una demo: no se realizará ningún cobro real. El pago solo se registra
        para confirmar tu renta.
      </p>
    </div>
  );
}