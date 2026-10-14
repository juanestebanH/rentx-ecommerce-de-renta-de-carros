import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { mensajeError } from '@/shared/utils/format';
import { Plus } from 'lucide-react';
import { ErrorState } from '@/features/reports/components/ErrorState';
import type { Vehicle, VehicleEstado } from '../../types/vehicle.types';
import type { Ocupacion } from '../../utils/occupancy';
import { FleetTableRow } from './FleetTableRow';
import { VehicleTarjetaMovil } from './VehicleTarjetaMovil';

interface FleetTableProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChangeEstado: (id: string, nombre: string, estado: VehicleEstado) => void;
  actionsDisabled: boolean;
  onNew: () => void;
  ocupaciones: Map<string, Ocupacion>;
  isEmptyByFilter: boolean;
}

export function FleetTable({
  vehicles,
  isLoading,
  error,
  onRetry,
  selectedId,
  onSelect,
  onChangeEstado,
  actionsDisabled,
  onNew,
  ocupaciones,
  isEmptyByFilter,
}: FleetTableProps) {
  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <FleetSkeleton />
        ) : error ? (
          <ErrorState
            message={mensajeError(error, 'No se pudieron cargar los vehículos.')}
            onRetry={onRetry}
          />
        ) : vehicles.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium">
                {isEmptyByFilter
                  ? 'Sin resultados'
                  : 'Aún no hay vehículos registrados'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEmptyByFilter
                  ? 'Prueba con otra búsqueda o filtro.'
                  : 'Registra el primer vehículo de la flota.'}
              </p>
              {!isEmptyByFilter && (
                <Button onClick={onNew} className="mt-4">
                  <Plus className="size-4" aria-hidden="true" />
                  Nuevo carro
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <ul className="hidden space-y-1 lg:block">
              {vehicles.map((vehicle) => (
                <FleetTableRow
                  key={vehicle.id_carro}
                  vehicle={vehicle}
                  ocupacion={ocupaciones.get(vehicle.id_carro)}
                  selected={selectedId === vehicle.id_carro}
                  onChangeEstado={onChangeEstado}
                  actionsDisabled={actionsDisabled}
                  onSelect={onSelect}
                />
              ))}
            </ul>

            <ul className="space-y-3 lg:hidden">
              {vehicles.map((vehicle) => (
                <VehicleTarjetaMovil
                  key={vehicle.id_carro}
                  vehicle={vehicle}
                  ocupacion={ocupaciones.get(vehicle.id_carro)}
                  selected={selectedId === vehicle.id_carro}
                  onChangeEstado={onChangeEstado}
                  actionsDisabled={actionsDisabled}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FleetSkeleton() {
  return (
    <>
      <ul className="hidden space-y-1 lg:block">
        {Array.from({ length: 5 }, (_, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-lg border border-transparent px-3 py-2.5"
          >
            <Skeleton className="size-12 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </li>
        ))}
      </ul>

      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-14 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}