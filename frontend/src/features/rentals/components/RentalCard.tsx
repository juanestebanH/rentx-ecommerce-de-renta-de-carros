import { useState } from 'react';
import { CalendarRange, CarFront, Clock, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';
import type { Rental } from '../types/rental.types';
import { formatRentalFechas, rentalDiasLabel } from '../utils/rental.format';
import { RentalStatusBadge } from './RentalStatusBadge';

interface RentalCardProps {
  rental: Rental;
  vehicle?: Vehicle;
  marca?: string;
  categoria?: string;
  onRequestCancel: (rental: Rental) => void;
}

export function RentalCard({
  rental,
  vehicle,
  marca,
  categoria,
  onRequestCancel,
}: RentalCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(vehicle?.foto) && !imgFailed;
  const showCancel = rental.estado === 'pendiente';

  return (
    <Card className="group h-full min-w-0 gap-0 overflow-hidden p-0 transition-shadow duration-300 ease-out hover:shadow-md sm:flex-row">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-card sm:w-48 sm:self-start">
        {showImage ? (
          <img
            src={vehicle?.foto ?? undefined}
            alt={vehicle?.nombre ?? 'Vehículo de la renta'}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/40 text-accent-foreground">
            <CarFront className="size-10" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-5 sm:pl-5">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">
            {vehicle?.nombre ?? 'Vehículo de la renta'}
          </h3>
          {vehicle && (categoria || marca) && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {[categoria, marca].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
          <p className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <CalendarRange
              className="size-4 shrink-0 text-accent-foreground"
              aria-hidden="true"
            />
            <span className="truncate tabular-nums">
              {formatRentalFechas(rental.fecha_inicio)} →{' '}
              {formatRentalFechas(rental.fecha_fin)}
            </span>
          </p>
          <p className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <Clock
              className="size-4 shrink-0 text-accent-foreground"
              aria-hidden="true"
            />
            <span className="truncate">
              {rentalDiasLabel(rental.dias_duracion)}
            </span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-4">
          <RentalStatusBadge estado={rental.estado} />
          {showCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRequestCancel(rental)}
            >
              <XCircle aria-hidden="true" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
