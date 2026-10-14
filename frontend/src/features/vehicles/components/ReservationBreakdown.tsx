import { formatTarifa } from '../utils/vehicle.format';

interface ReservationBreakdownProps {
  tarifa: number;
  days: number;
}

export function ReservationBreakdown({
  tarifa,
  days,
}: ReservationBreakdownProps) {
  const total = tarifa * days;
  return (
    <dl className="flex flex-col gap-1.5 text-sm">
      <div className="flex items-center justify-between gap-3">
        <dt className="text-muted-foreground">Tarifa por día</dt>
        <dd className="tabular-nums text-muted-foreground">
          {formatTarifa(tarifa)}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-3">
        <dt className="text-muted-foreground">
          {days} {days === 1 ? 'día' : 'días'} de renta
        </dt>
        <dd className="tabular-nums text-muted-foreground">
          {formatTarifa(total)}
        </dd>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
        <dt className="font-semibold">Total</dt>
        <dd className="text-xl font-bold tabular-nums text-accent-foreground">
          {formatTarifa(total)}
        </dd>
      </div>
    </dl>
  );
}