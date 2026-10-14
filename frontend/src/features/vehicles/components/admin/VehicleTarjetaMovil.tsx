import { Eye } from 'lucide-react';
import { cn } from 'cn';
import { Button } from '@/shared/components/ui/button';
import { formatTarifa } from '../../utils/vehicle.format';
import type { Vehicle, VehicleEstado } from '../../types/vehicle.types';
import type { Ocupacion } from '../../utils/occupancy';
import { OccupancyBadge } from './OccupancyBadge';
import { VehicleEstadoBadge } from './VehicleEstadoBadge';
import { VehicleRowActions } from './VehicleRowActions';
import { VehicleThumb } from './VehicleThumb';

interface VehicleTarjetaMovilProps {
  vehicle: Vehicle;
  ocupacion: Ocupacion | undefined;
  selected: boolean;
  onChangeEstado: (id: string, nombre: string, estado: VehicleEstado) => void;
  actionsDisabled: boolean;
  onSelect: (id: string) => void;
}

export function VehicleTarjetaMovil({
  vehicle,
  ocupacion,
  selected,
  onChangeEstado,
  actionsDisabled,
  onSelect,
}: VehicleTarjetaMovilProps) {
  const inactive = vehicle.estado === 'inactivo';

  return (
    <li
      className={cn(
        'rounded-xl border bg-card p-4',
        selected ? 'border-[var(--accent-border)] bg-[var(--accent-bg)]' : 'border-border',
      )}
    >
      <div className="flex items-start gap-3">
        <VehicleThumb foto={vehicle.foto} inactive={inactive} className="size-14" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn('truncate font-medium', inactive && 'text-muted-foreground')}>
              {vehicle.nombre}
            </span>
            <span className="rounded border border-border px-1 py-px font-mono text-xs text-muted-foreground">
              {vehicle.id_carro}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Modelo {vehicle.ano}</p>
          <div className="mt-1.5">
            <VehicleEstadoBadge estado={vehicle.estado} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium tabular-nums">
          {formatTarifa(vehicle.tarifa)}
        </span>
        {vehicle.estado === 'activo' && <OccupancyBadge ocupacion={ocupacion} />}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onSelect(vehicle.id_carro)}
        >
          <Eye className="size-4" aria-hidden="true" />
          Ver detalle
        </Button>
        <VehicleRowActions
          vehicle={vehicle}
          disabled={actionsDisabled}
          onVerDetalle={() => onSelect(vehicle.id_carro)}
          onChangeEstado={(estado) =>
            onChangeEstado(vehicle.id_carro, vehicle.nombre, estado)
          }
        />
      </div>
    </li>
  );
}
