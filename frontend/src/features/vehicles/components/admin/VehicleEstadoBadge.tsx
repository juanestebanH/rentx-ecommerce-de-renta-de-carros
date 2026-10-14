import { cn } from 'cn';
import { ESTADO_DOTS, ESTADO_LABELS, ESTADO_TEXT_CLASSES } from '../../utils/vehicle.format';
import type { VehicleEstado } from '../../types/vehicle.types';

interface VehicleEstadoBadgeProps {
  estado: VehicleEstado;
}

export function VehicleEstadoBadge({ estado }: VehicleEstadoBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-1.5 py-px text-[11px] font-medium',
        ESTADO_TEXT_CLASSES[estado],
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', ESTADO_DOTS[estado])}
      />
      {ESTADO_LABELS[estado]}
    </span>
  );
}
