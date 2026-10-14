import { Check, Ellipsis, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from 'cn';
import {
  ESTADO_DOTS,
  ESTADO_LABELS,
} from '../../utils/vehicle.format';
import { VEHICLE_ESTADOS } from '../../types/vehicle.types';
import type { Vehicle, VehicleEstado } from '../../types/vehicle.types';

interface VehicleRowActionsProps {
  vehicle: Vehicle;
  disabled: boolean;
  onVerDetalle: () => void;
  onChangeEstado: (estado: VehicleEstado) => void;
}

const ESTADO_STYLES: Record<VehicleEstado, string> = {
  activo:
    'text-accent-foreground focus:bg-[var(--accent-bg)] focus:text-accent-foreground',
  mantenimiento:
    'text-amber-700 focus:bg-amber-600/10 focus:text-amber-700',
  inactivo:
    'text-muted-foreground focus:bg-muted focus:text-muted-foreground',
};

export function VehicleRowActions({
  vehicle,
  disabled,
  onVerDetalle,
  onChangeEstado,
}: VehicleRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Acciones de ${vehicle.nombre}`}
          disabled={disabled}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <Ellipsis className="size-5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={onVerDetalle}>
          <Eye aria-hidden="true" />
          Ver detalle
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
        {VEHICLE_ESTADOS.map((estado) => {
          const isCurrent = vehicle.estado === estado;
          return (
            <DropdownMenuItem
              key={estado}
              disabled={disabled || isCurrent}
              onSelect={() => onChangeEstado(estado)}
              className={cn('gap-2.5', ESTADO_STYLES[estado])}
            >
              <span
                aria-hidden="true"
                className={cn('size-2 shrink-0 rounded-full', ESTADO_DOTS[estado])}
              />
              {ESTADO_LABELS[estado]}
              {isCurrent && (
                <Check className="ml-auto size-4" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}