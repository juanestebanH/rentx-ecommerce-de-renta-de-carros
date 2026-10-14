import { CalendarCheck2, CalendarClock, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { Rental } from '@/features/rentals/types/rental.types';
import { downloadComprobante } from '../utils/comprobante';
import { METODO_PAGO_LABELS } from '../utils/payment.format';
import type { Payment } from '../types/payment.types';

interface ReservaSuccessProps {
  renta: Rental;
  pago: Payment;
  vehicleName: string;
  rangoLabel: string;
  totalLabel: string;
}

export function ReservaSuccess({
  renta,
  pago,
  vehicleName,
  rangoLabel,
  totalLabel,
}: ReservaSuccessProps) {
  const confirmada = pago.estado === 'completado';
  const Icon = confirmada ? CalendarCheck2 : CalendarClock;

  const descargarComprobante = () => {
    downloadComprobante({
      idRenta: renta.id_renta,
      vehicleName,
      fechaInicio: renta.fecha_inicio,
      fechaFin: renta.fecha_fin,
      metodoPagoLabel: METODO_PAGO_LABELS[pago.metodo_pago],
      totalLabel,
    });
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center gap-2 px-6 pb-4 pt-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-7" aria-hidden="true" />
        </span>
        <h2 className="my-0 mt-1 text-2xl font-semibold tracking-tight">
          {confirmada ? '¡Reserva confirmada!' : 'Reserva creada — pago pendiente'}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {confirmada
            ? `Recibimos tu pago con tarjeta. ${vehicleName} quedó confirmado para tus fechas.`
            : pago.metodo_pago === 'efectivo'
              ? `${vehicleName} quedó reservado. Pagas en efectivo al recoger el carro y un administrador confirmará la reserva.`
              : `${vehicleName} quedó reservado. Un administrador verificará tu transferencia y confirmará la reserva.`}
        </p>
      </div>

      <dl className="divide-y divide-border border-y border-border text-sm">
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <dt className="text-muted-foreground">Referencia</dt>
          <dd className="font-semibold tabular-nums">{renta.id_renta}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <dt className="text-muted-foreground">Fechas</dt>
          <dd className="tabular-nums">{rangoLabel}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <dt className="text-muted-foreground">Método de pago</dt>
          <dd className="font-medium">{METODO_PAGO_LABELS[pago.metodo_pago]}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <dt className="text-muted-foreground">Total</dt>
          <dd className="text-lg font-bold tabular-nums text-accent-foreground">
            {totalLabel}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 p-6 pt-5 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/mis-rentas">Ver mis rentas</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={descargarComprobante}
        >
          <Download className="size-4" aria-hidden="true" />
          Descargar comprobante
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link to="/catalogo">Seguir explorando</Link>
        </Button>
      </div>

      <p className="pb-6 text-center text-xs text-muted-foreground">
        Guarda la referencia {renta.id_renta} para hacer seguimiento de tu renta.
      </p>
    </Card>
  );
}