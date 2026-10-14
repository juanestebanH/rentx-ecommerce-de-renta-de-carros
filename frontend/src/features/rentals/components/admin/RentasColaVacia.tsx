import { CheckCircle2, ListChecks } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface RentasColaVaciaProps {
  totalRentas: number;
  onVerTodas: () => void;
}

/**
 * La cola en cero es el final feliz de la pantalla, no un vacío: el
 * administrador acaba de cerrar el día y necesita leer eso, no un mensaje de
 * "no hay datos".
 */
export function RentasColaVacia({ totalRentas, onVerTodas }: RentasColaVaciaProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-[var(--accent-bg)] text-primary"
      >
        <CheckCircle2 className="size-6" />
      </span>
      <div>
        <p className="font-semibold">Ninguna renta espera acción</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          {totalRentas > 0
            ? `Las ${totalRentas} rentas del panel están con su pago y su estado al día. Puedes revisar el histórico cuando quieras.`
            : 'Todavía no hay rentas registradas. Cuando un cliente reserve, aparecerá aquí.'}
        </p>
      </div>
      {totalRentas > 0 && (
        <Button variant="outline" onClick={onVerTodas}>
          <ListChecks aria-hidden="true" />
          Ver todas las rentas
        </Button>
      )}
    </div>
  );
}
