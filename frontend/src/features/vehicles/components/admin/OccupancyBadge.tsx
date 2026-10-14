import { Badge } from '@/shared/components/ui/badge';
import { CalendarClock, CarFront, Check } from 'lucide-react';
import type { Ocupacion } from '../../utils/occupancy';
import { fechaVueltaLabel } from '../../utils/occupancy';

interface OccupancyBadgeProps {
  ocupacion: Ocupacion | undefined;
}

export function OccupancyBadge({ ocupacion }: OccupancyBadgeProps) {
  if (!ocupacion) {
    return (
      <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
        <Check className="size-3" aria-hidden="true" />
        Disponible
      </Badge>
    );
  }

  const textoVuelta = `vuelve el ${fechaVueltaLabel(ocupacion.fecha_fin)}`;

  if (ocupacion.tipo === 'en_uso') {
    return (
      <Badge className="border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground">
        <CarFront className="size-3" aria-hidden="true" />
        En uso · {textoVuelta}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-border text-muted-foreground">
      <CalendarClock className="size-3 text-muted-foreground" aria-hidden="true" />
      Reservado · hasta {fechaVueltaLabel(ocupacion.fecha_fin)}
    </Badge>
  );
}