import { CarFront, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/card';
import { formatRentalFechas, rentalDiasLabel } from '@/features/rentals/utils/rental.format';
import { transmisionLabel } from '@/features/vehicles/utils/vehicle.format';
import type { Vehicle } from '@/features/vehicles/types/vehicle.types';

interface VehicleBookingCardProps {
  vehicle: Vehicle;
  marca: string;
  categoria: string;
  fechaInicio: string;
  fechaFin: string;
  days: number;
  detalleHref: string;
}

export function VehicleBookingCard({
  vehicle,
  marca,
  categoria,
  fechaInicio,
  fechaFin,
  days,
  detalleHref,
}: VehicleBookingCardProps) {
  const combustible =
    vehicle.combustible.charAt(0).toUpperCase() + vehicle.combustible.slice(1);

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative aspect-video w-full bg-card">
          {vehicle.foto ? (
            <img
              src={vehicle.foto}
              alt={vehicle.nombre}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <CarFront className="size-10" aria-hidden="true" />
            </span>
          )}
        </div>
        <div className="p-5">
          <h2 className="my-0 text-lg font-semibold tracking-tight">
            {vehicle.nombre}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {marca} · {categoria}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <li className="rounded-full border border-border px-2.5 py-1">
              {transmisionLabel(vehicle.transmision)}
            </li>
            <li className="rounded-full border border-border px-2.5 py-1">
              {combustible}
            </li>
            <li className="rounded-full border border-border px-2.5 py-1">
              {vehicle.capacidad} personas
            </li>
          </ul>
        </div>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="my-0 text-base font-semibold tracking-tight">
              Fechas de la renta
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {rentalDiasLabel(days)}
            </p>
          </div>
          <Link
            to={detalleHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Cambiar fechas
          </Link>
        </div>
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Entrega</dt>
            <dd className="font-medium tabular-nums">
              {formatRentalFechas(fechaInicio)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Devolución</dt>
            <dd className="font-medium tabular-nums">
              {formatRentalFechas(fechaFin)}
            </dd>
          </div>
        </dl>
      </Card>
    </>
  );
}