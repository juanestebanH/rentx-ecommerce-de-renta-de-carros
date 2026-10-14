import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CarFront, Wrench } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ApiError } from '@/shared/lib/apiClient';
import { VehicleDetailInfo } from '@/features/vehicles/components/VehicleDetailInfo';
import { VehicleDetailSkeleton } from '@/features/vehicles/components/VehicleDetailSkeleton';
import { ReservationRail } from '@/features/vehicles/components/ReservationRail';
import {
  useVehicle,
  useVehicleAvailability,
} from '@/features/vehicles/hooks/useVehicles';
import type { CatalogDates } from '@/features/vehicles/types/vehicle.types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function initialDatesFromUrl(searchParams: URLSearchParams): CatalogDates {
  const dates: CatalogDates = {};
  const fechaInicio = searchParams.get('fecha_inicio');
  const fechaFin = searchParams.get('fecha_fin');
  if (fechaInicio && DATE_RE.test(fechaInicio)) dates.fecha_inicio = fechaInicio;
  if (fechaFin && DATE_RE.test(fechaFin)) dates.fecha_fin = fechaFin;
  return dates;
}

function catalogBackHref(dates: CatalogDates): string {
  if (!dates.fecha_inicio || !dates.fecha_fin) return '/catalogo';
  const params = new URLSearchParams({
    fecha_inicio: dates.fecha_inicio,
    fecha_fin: dates.fecha_fin,
  });
  return `/catalogo?${params.toString()}`;
}

function VehicleDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dates, setDates] = useState<CatalogDates>(() =>
    initialDatesFromUrl(searchParams),
  );

  const vehicleQuery = useVehicle(id);
  const vehicle = vehicleQuery.data;
  const availability = useVehicleAvailability(id, dates);
  const datesValid = Boolean(
    dates.fecha_inicio && dates.fecha_fin && dates.fecha_inicio <= dates.fecha_fin,
  );

  const handleDatesChange = (patch: CatalogDates) => {
    const next = { ...dates, ...patch };
    const nextParams = Object.fromEntries(
      Object.entries(next).filter((entry) => entry[1] !== undefined),
    ) as Record<string, string>;
    setDates(next);
    setSearchParams(nextParams, { replace: true });
  };

  const notFound =
    vehicleQuery.isError &&
    vehicleQuery.error instanceof ApiError &&
    vehicleQuery.error.status === 404;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-8 sm:px-6">
      <Link
        to={catalogBackHref(dates)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al catálogo
      </Link>

      {vehicleQuery.isLoading ? (
        <div className="mt-6">
          <VehicleDetailSkeleton />
        </div>
      ) : notFound ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
            <CarFront className="size-6" aria-hidden="true" />
          </span>
          <p className="text-lg font-semibold">Carro no encontrado</p>
          <p className="max-w-md text-sm text-muted-foreground">
            El vehículo que buscas no existe o ya no forma parte del catálogo.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link to="/catalogo">Ir al catálogo</Link>
          </Button>
        </div>
      ) : vehicleQuery.isError || !vehicle ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
            <Wrench className="size-6" aria-hidden="true" />
          </span>
          <p role="alert" className="text-lg font-semibold">
            No se pudieron cargar los datos del carro
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            Si el problema persiste, revisa tu conexión a internet.
          </p>
          <Button variant="outline" className="mt-2" onClick={() => vehicleQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <header className="min-w-0 lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="my-0 break-words text-4xl font-bold tracking-tight">
                  {vehicle.nombre}
                </h1>
                {Number.isFinite(vehicle.ano) && (
                  <span className="text-xl tabular-nums text-muted-foreground">
                    {vehicle.ano}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-base text-muted-foreground">
              {vehicle.id_marca} ·{' '}
              {vehicle.estado === 'mantenimiento'
                ? 'En mantenimiento'
                : vehicle.estado === 'inactivo'
                  ? 'Temporalmente no disponible'
                  : 'Listo para rentar'}
            </p>
          </header>

          <div className="flex min-w-0 flex-col gap-6">
            <VehicleDetailInfo vehicle={vehicle} />
          </div>

          <ReservationRail
            vehicle={vehicle}
            dates={dates}
            onDatesChange={handleDatesChange}
            availability={{
              enabled: datesValid,
              isPending: availability.isPending && datesValid,
              isError: datesValid && availability.isError,
              available: availability.data?.available,
              refetch: () => void availability.refetch(),
            }}
          />
        </div>
      )}
    </div>
  );
}

export default VehicleDetailPage;