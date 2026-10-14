import { CarFront, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';

export function MissingParams() {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
        <CarFront className="size-6" aria-hidden="true" />
      </span>
      <p className="text-lg font-semibold">No se pudo preparar tu reserva</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Faltan datos como el carro o las fechas. Vuelve al catálogo y elige un
        carro para empezar.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/catalogo">Ir al catálogo</Link>
      </Button>
    </div>
  );
}

interface RangeProblemStateProps {
  problem: 'pasado' | 'minimo';
  detalleHref: string;
}

export function RangeProblemState({
  problem,
  detalleHref,
}: RangeProblemStateProps) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
        <CarFront className="size-6" aria-hidden="true" />
      </span>
      <p className="text-lg font-semibold">
        Las fechas no permiten reservar
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {problem === 'pasado'
          ? 'La fecha de inicio de la renta no puede estar en el pasado.'
          : 'La renta debe ser de al menos 2 días. Vuelve al carro y elige un rango mayor.'}
      </p>
      <Button asChild className="mt-2">
        <Link to={detalleHref}>Elegir otras fechas</Link>
      </Button>
    </div>
  );
}

interface VehicleErrorStateProps {
  carNotFound: boolean;
  onRetry: () => void;
}

export function VehicleErrorState({
  carNotFound,
  onRetry,
}: VehicleErrorStateProps) {
  return (
    <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
        {carNotFound ? (
          <CarFront className="size-6" aria-hidden="true" />
        ) : (
          <Wrench className="size-6" aria-hidden="true" />
        )}
      </span>
      <p className="text-lg font-semibold">
        {carNotFound ? 'Carro no encontrado' : 'No se pudieron cargar los datos del carro'}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {carNotFound
          ? 'El vehículo ya no forma parte de la plataforma.'
          : 'Si el problema persiste, revisa tu conexión a internet.'}
      </p>
      {carNotFound ? (
        <Button asChild variant="outline" className="mt-2">
          <Link to="/catalogo">Ir al catálogo</Link>
        </Button>
      ) : (
        <Button variant="outline" className="mt-2" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}