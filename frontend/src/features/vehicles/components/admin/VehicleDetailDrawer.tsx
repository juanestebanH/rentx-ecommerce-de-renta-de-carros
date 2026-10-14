import { Check, Pencil } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SideDrawer } from '@/shared/components/ui/SideDrawer';
import { useRetainedValue } from '@/shared/hooks/useRetainedValue';
import { SpecsList } from './SpecsList';
import { OccupancyBadge } from './OccupancyBadge';
import { VehiclePhotoFrame } from '../VehiclePhotoFrame';
import type { Vehicle } from '../../types/vehicle.types';
import type { Ocupacion } from '../../utils/occupancy';
import {
  ESTADO_LABELS,
  FEATURE_LABELS,
  formatTarifa,
} from '../../utils/vehicle.format';

interface VehicleDetailDrawerProps {
  vehicle: Vehicle | null;
  ocupacion: Ocupacion | undefined;
  onClose: () => void;
  onEdit: (vehicle: Vehicle) => void;
}

export function VehicleDetailDrawer({
  vehicle,
  ocupacion,
  onClose,
  onEdit,
}: VehicleDetailDrawerProps) {
  // Se conserva el último vehículo para que la animación de salida no muestre
  // el panel vacío cuando el padre limpia la selección al cerrar.
  const contenido = useRetainedValue(vehicle);

  const features = contenido
    ? Object.entries(FEATURE_LABELS)
        .filter(([key]) => contenido[key as keyof Vehicle] === true)
        .map(([, label]) => label)
    : [];

  return (
    <SideDrawer
      open={vehicle !== null}
      onClose={onClose}
      eyebrow="Detalle del vehículo"
      title={contenido ? `${contenido.nombre} · ${contenido.id_carro}` : ''}
      subtitle={contenido ? `Modelo ${contenido.ano} · ${contenido.id_marca}` : ''}
    >
      {contenido && (
        <>
          <VehiclePhotoFrame
            src={contenido.foto}
            alt={contenido.nombre}
            className="rounded-2xl"
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              variant={
                contenido.estado === 'mantenimiento' ? 'secondary' : 'outline'
              }
              className={
                contenido.estado === 'activo'
                  ? 'border-[var(--accent-border)] text-accent-foreground'
                  : undefined
              }
            >
              {ESTADO_LABELS[contenido.estado]}
            </Badge>
            {contenido.estado === 'activo' && (
              <OccupancyBadge ocupacion={ocupacion} />
            )}
          </div>

          <p className="mt-4 inline-flex items-baseline gap-1.5 text-sm text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Precio por día
            </span>
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {formatTarifa(contenido.tarifa)}
            </span>
          </p>

          <SpecsList vehicle={contenido} />

          {features.length > 0 && (
            <section aria-labelledby="admin-equipo-titulo" className="mt-6">
              <h2
                id="admin-equipo-titulo"
                className="text-lg font-semibold tracking-tight"
              >
                Equipamiento
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 py-1.5 text-sm font-medium text-accent-foreground"
                  >
                    <Check className="size-3.5 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Button className="mt-6 w-full" onClick={() => onEdit(contenido)}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Button>
        </>
      )}
    </SideDrawer>
  );
}
