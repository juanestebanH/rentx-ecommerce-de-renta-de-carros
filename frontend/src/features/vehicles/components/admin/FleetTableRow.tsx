import { cn } from 'cn';
import { formatTarifa } from '../../utils/vehicle.format';
import type { Vehicle, VehicleEstado } from '../../types/vehicle.types';
import type { Ocupacion } from '../../utils/occupancy';
import { OccupancyBadge } from './OccupancyBadge';
import { VehicleEstadoBadge } from './VehicleEstadoBadge';
import { VehicleRowActions } from './VehicleRowActions';
import { VehicleThumb } from './VehicleThumb';

interface FleetTableRowProps {
  vehicle: Vehicle;
  ocupacion: Ocupacion | undefined;
  selected: boolean;
  onChangeEstado: (id: string, nombre: string, estado: VehicleEstado) => void;
  actionsDisabled: boolean;
  onSelect: (id: string) => void;
}

export function FleetTableRow({
  vehicle,
  ocupacion,
  selected,
  onChangeEstado,
  actionsDisabled,
  onSelect,
}: FleetTableRowProps) {
  const inactive = vehicle.estado === 'inactivo';

  return (
    <li>
      <div
        onClick={() => onSelect(vehicle.id_carro)}
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
          inactive && 'bg-muted/40 saturate-50',
          selected
            ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]'
            : 'border-transparent hover:bg-accent/50',
        )}
      >
        <VehicleThumb foto={vehicle.foto} inactive={inactive} className="size-12" />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span
              className={cn('truncate font-medium', inactive && 'text-muted-foreground')}
            >
              {vehicle.nombre}
            </span>
            <span className="rounded border border-border px-1 py-px font-mono text-xs text-muted-foreground">
              {vehicle.id_carro}
            </span>
            <VehicleEstadoBadge estado={vehicle.estado} />
          </span>
          <span className="mt-0.5 block space-x-2 text-sm text-muted-foreground">
            <span>Modelo {vehicle.ano}</span>
          </span>
        </span>

        <span className="flex w-52 shrink-0 items-center">
          {vehicle.estado === 'activo' ? (
            <OccupancyBadge ocupacion={ocupacion} />
          ) : null}
        </span>

        <span className="w-24 shrink-0 text-right text-sm font-medium tabular-nums">
          {formatTarifa(vehicle.tarifa)}
        </span>

        <span
          className="shrink-0"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <VehicleRowActions
            vehicle={vehicle}
            disabled={actionsDisabled}
            onVerDetalle={() => onSelect(vehicle.id_carro)}
            onChangeEstado={(estado) =>
              onChangeEstado(vehicle.id_carro, vehicle.nombre, estado)
            }
          />
        </span>
      </div>
    </li>
  );
}