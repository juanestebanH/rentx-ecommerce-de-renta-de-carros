import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarFront, Cog, Fuel, Users } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import {
  ESTADO_LABELS,
  formatTarifa,
  transmisionLabel,
} from '../utils/vehicle.format';
import type { CatalogDates, Vehicle } from '../types/vehicle.types';

interface VehicleCardHorizontalProps {
  vehicle: Vehicle;
  dates?: CatalogDates;
}

function detailHref(id: string, dates?: CatalogDates): string {
  if (!dates?.fecha_inicio || !dates.fecha_fin) return `/carros/${id}`;
  const params = new URLSearchParams({
    fecha_inicio: dates.fecha_inicio,
    fecha_fin: dates.fecha_fin,
  });
  return `/carros/${id}?${params.toString()}`;
}

export function VehicleCardHorizontal({
  vehicle,
  dates,
}: VehicleCardHorizontalProps) {
  const { foto, nombre, ano, tarifa, estado } = vehicle;
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(foto) && !imgFailed;

  const anio = Number.isFinite(ano) ? String(ano) : '—';
  const capacidad =
    Number.isFinite(vehicle.capacidad)
      ? `${vehicle.capacidad} pasajeros`
      : '—';

  return (
    <Card className="group h-full min-w-0 gap-0 overflow-hidden p-0 transition-shadow duration-300 ease-out hover:shadow-md sm:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-card sm:aspect-auto sm:w-[38%] lg:w-[35%]">
        {showImage ? (
          <img
            src={foto ?? undefined}
            alt={nombre}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/40 text-accent-foreground">
            <CarFront className="size-12" />
          </div>
        )}
        {estado !== 'activo' && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            {ESTADO_LABELS[estado]}
          </Badge>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:pl-0">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-base font-semibold leading-snug">
            <span className="line-clamp-2 break-words">{nombre}</span>
          </h3>
          <p className="text-sm tabular-nums text-muted-foreground">{anio}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Cog className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{transmisionLabel(vehicle.transmision)}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Fuel className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{vehicle.combustible || '—'}</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{capacidad}</span>
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="break-words text-xl font-bold tabular-nums text-accent-foreground">
              {formatTarifa(tarifa)}
              <span className="text-sm font-normal text-muted-foreground">
                {' '}
                / día
              </span>
            </p>
          </div>
          <Button asChild>
            <Link to={detailHref(vehicle.id_carro, dates)}>Ver detalle</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}