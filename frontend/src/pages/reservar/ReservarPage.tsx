import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError } from '@/shared/lib/apiClient';
import { Card } from '@/shared/components/ui/card';
import { useMarcas } from '@/features/vehicles/hooks/useVehicles';
import { AvailabilityVerdict } from '@/features/vehicles/components/AvailabilityVerdict';
import { VehicleDetailSkeleton } from '@/features/vehicles/components/VehicleDetailSkeleton';
import { formatTarifa } from '@/features/vehicles/utils/vehicle.format';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { useReservationFlow } from '@/features/rentals/hooks/useReservationFlow';
import { formatRentalFechas } from '@/features/rentals/utils/rental.format';
import {
  buildDetalleHref,
  parseReservarParams,
} from '@/features/rentals/utils/reservation';
import { MetodoPagoOptions } from '@/features/payments/components/MetodoPagoOptions';
import { ReservaSuccess } from '@/features/payments/components/ReservaSuccess';
import { VehicleBookingCard } from './VehicleBookingCard';
import { ReservationSummaryCard } from './ReservationSummaryCard';
import {
  MissingParams,
  RangeProblemState,
  VehicleErrorState,
} from './ReservaStates';

function marcaLabel(slug: string, marcas: Map<string, string>): string {
  return (
    marcas.get(slug.toLowerCase()) ?? slug.charAt(0).toUpperCase() + slug.slice(1)
  );
}

function ReservarPage() {
  const [searchParams] = useSearchParams();
  const params = useMemo(() => parseReservarParams(searchParams), [searchParams]);
  const flow = useReservationFlow(params);
  const marcasQuery = useMarcas();

  const marcas = new Map(
    (marcasQuery.data ?? []).map((marca) => [marca.nombre.toLowerCase(), marca.nombre]),
  );

  if (!params) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
        <MissingParams />
      </div>
    );
  }

  const detalleHref = buildDetalleHref(params);

  if (flow.rangeProblem) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
        <RangeProblemState problem={flow.rangeProblem} detalleHref={detalleHref} />
      </div>
    );
  }

  const vehicleError = flow.vehicleQuery.error;
  const carNotFound =
    flow.vehicleQuery.isError &&
    vehicleError instanceof ApiError &&
    vehicleError.status === 404;

  if (flow.vehicleQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:px-6">
        <Link
          to={detalleHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al carro
        </Link>
        <div className="mt-6">
          <VehicleDetailSkeleton />
        </div>
      </div>
    );
  }

  if (flow.vehicleQuery.isError || !flow.vehicle) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
        <VehicleErrorState
          carNotFound={carNotFound}
          onRetry={() => flow.vehicleQuery.refetch()}
        />
      </div>
    );
  }

  const vehicle = flow.vehicle;
  const days = flow.days ?? 0;

  if (flow.stage.kind === 'exito') {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-10 sm:px-6">
        <ReservaSuccess
          renta={flow.stage.renta}
          pago={flow.stage.pago}
          vehicleName={vehicle.nombre}
          rangoLabel={`${formatRentalFechas(params.fecha_inicio)} a ${formatRentalFechas(params.fecha_fin)}`}
          totalLabel={formatTarifa(flow.stage.pago.total_pago)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Link
        to={detalleHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Volver al carro
      </Link>

      <header className="mt-4">
        <h1 className="my-0 text-2xl font-semibold tracking-tight sm:text-3xl">
          Reserva
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Confirma tus fechas, elige el método de pago y cierra la renta de{' '}
          {vehicle.nombre}.
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <VehicleBookingCard
            vehicle={vehicle}
            marca={marcaLabel(vehicle.id_marca, marcas)}
            categoria={categoriaLabel(vehicle.id_categoria)}
            fechaInicio={params.fecha_inicio}
            fechaFin={params.fecha_fin}
            days={days}
            detalleHref={detalleHref}
          />

          <Card className="flex flex-col gap-4 p-5">
            <div>
              <h2 className="my-0 text-lg font-semibold tracking-tight">
                Método de pago
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                El método no cambia el total, solo cómo se cierra tu renta.
              </p>
            </div>

            <div className="flex min-h-10 items-start gap-2 rounded-xl border border-border bg-accent/30 p-3">
              <AvailabilityVerdict
                hasDates
                isPending={flow.availability.isPending}
                isError={flow.availability.isError}
                available={flow.availability.data?.available}
                onRetry={() => flow.availability.refetch()}
              />
            </div>

            <MetodoPagoOptions
              selected={flow.metodoPago}
              onChange={flow.setMetodoPago}
              disabled={flow.isRunning || !flow.available}
            />
          </Card>
        </div>

        <ReservationSummaryCard
          tarifa={vehicle.tarifa}
          days={days}
          metodoPago={flow.metodoPago}
          canConfirm={flow.canConfirm}
          isRunning={flow.isRunning}
          stage={flow.stage}
          detalleHref={detalleHref}
          onConfirm={() => void flow.confirmar()}
          onReintentarPago={(renta) => void flow.reintentarPago(renta)}
        />
      </div>
    </div>
  );
}

export default ReservarPage;