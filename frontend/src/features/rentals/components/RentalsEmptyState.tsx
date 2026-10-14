import { Link } from 'react-router-dom';
import { CarFront } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function RentalsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-card/50 py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary">
        <CarFront className="size-7" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold">Aún no tienes rentas</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Cuando reserves un carro, aparecerá aquí para que sigas su estado y
          puedas cancelar una renta pendiente si cambias de planes.
        </p>
      </div>
      <Button asChild>
        <Link to="/catalogo">Explorar el catálogo</Link>
      </Button>
    </div>
  );
}