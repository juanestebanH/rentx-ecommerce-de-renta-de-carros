import { SearchX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { CatalogDates, Vehicle } from '../types/vehicle.types';
import { VehicleCardHorizontal } from './VehicleCardHorizontal';
import { VehicleCardSkeleton } from './VehicleCardSkeleton';

const LIST_SKELETON_COUNT = 6;

interface CatalogResultsProps {
  vehicles: Vehicle[];
  dates: CatalogDates;
  isLoading: boolean;
  isLoadingAvailability: boolean;
  isError: boolean;
  total: number;
  hasFilters: boolean;
  hasDates: boolean;
  onRetry: () => void;
  onClear: () => void;
}

export function CatalogResults({
  vehicles,
  dates,
  isLoading,
  isLoadingAvailability,
  isError,
  total,
  hasFilters,
  hasDates,
  onRetry,
  onClear,
}: CatalogResultsProps) {
  if (isLoading || isLoadingAvailability) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: LIST_SKELETON_COUNT }).map((_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <p role="alert" className="text-sm font-medium text-destructive">
          No se pudieron cargar los carros.
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Si el problema persiste, revisa tu conexión a internet.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (total === 0) {
    const title = hasDates || hasFilters ? 'Sin resultados' : 'No hay carros disponibles';
    const description = hasDates
      ? 'Ningún carro está disponible en las fechas seleccionadas. Prueba con otras fechas o amplía los filtros.'
      : hasFilters
        ? 'Ningún carro cumple con los filtros seleccionados. Prueba con filtros más amplios.'
        : 'Por el momento no hay carros en el catálogo. Comprueba de nuevo más tarde.';
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
          <SearchX className="size-6" />
        </span>
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        {hasDates || hasFilters ? (
          <Button variant="outline" onClick={onClear}>
            Limpiar filtros
          </Button>
        ) : (
          <Button variant="outline" onClick={onRetry}>
            Comprobar de nuevo
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCardHorizontal
          key={vehicle.id_carro}
          vehicle={vehicle}
          dates={dates}
        />
      ))}
    </div>
  );
}