import {
  CalendarCheck2,
  CalendarX2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AvailabilityVerdictProps {
  hasDates: boolean;
  isPending: boolean;
  isError: boolean;
  available?: boolean;
  onRetry: () => void;
}

export function AvailabilityVerdict({
  hasDates,
  isPending,
  isError,
  available,
  onRetry,
}: AvailabilityVerdictProps) {
  if (!hasDates) {
    return (
      <p className="text-sm text-muted-foreground">
        Selecciona las fechas para ver la disponibilidad y el total.
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p role="alert" className="text-sm font-medium text-destructive">
          No se pudo verificar la disponibilidad.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-accent-foreground"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>Verificando disponibilidad…</span>
      </p>
    );
  }

  if (available) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <CalendarCheck2 className="size-4 shrink-0" aria-hidden="true" />
        <span>Disponible en estas fechas</span>
      </p>
    );
  }

  return (
    <p
      role="status"
      className="flex items-center gap-2 text-sm font-medium text-destructive"
    >
      <CalendarX2 className="size-4 shrink-0" aria-hidden="true" />
      <span>No disponible en este rango. Prueba otras fechas.</span>
    </p>
  );
}