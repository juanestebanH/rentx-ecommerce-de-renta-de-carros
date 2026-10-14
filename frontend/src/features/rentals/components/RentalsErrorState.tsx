import { CalendarX2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface RentalsErrorStateProps {
  onRetry: () => void;
}

export function RentalsErrorState({ onRetry }: RentalsErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent/50 text-accent-foreground">
        <CalendarX2 className="size-6" aria-hidden="true" />
      </span>
      <p role="alert" className="text-sm font-medium text-destructive">
        No se pudieron cargar tus rentas.
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Si el problema persiste, revisa tu conexión o inicia sesión de nuevo.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}