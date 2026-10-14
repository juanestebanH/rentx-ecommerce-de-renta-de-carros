import { Skeleton } from '@/shared/components/ui/skeleton';
import { Badge } from '@/shared/components/ui/badge';
import { formatRango, mensajeError } from '@/shared/utils/format';
import { rentalDiasLabel } from '@/features/rentals/utils/rental.format';
import type { RentalConVehiculo } from '@/features/rentals/types/rental.types';
import { ErrorState } from '@/features/reports/components/ErrorState';
import { EstadoRentaBadge } from '@/features/reports/components/EstadoRentaBadge';

interface HistorialRentasProps {
  data?: RentalConVehiculo[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function HistorialRentas({ data, isLoading, error, onRetry }: HistorialRentasProps) {
  return (
    <div>
      {isLoading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 border-b border-border/60 pb-2 last:border-0"
            >
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      ) : error || !data ? (
        <div className="mt-3">
          <ErrorState
            message={mensajeError(error, 'No se pudieron cargar las rentas.')}
            onRetry={onRetry}
          />
        </div>
      ) : data.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Sin rentas registradas para este cliente.
        </p>
      ) : (
        <div className="relative mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
<caption className="sr-only">
              Historial de rentas del cliente con vehículo, placa, rango
              de fechas, duración y estado
            </caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="pb-2 pr-4 font-medium">
                  Vehículo
                </th>
                <th scope="col" className="pb-2 pr-4 font-medium">
                  Placa
                </th>
                <th scope="col" className="pb-2 pr-4 font-medium">
                  Rango
                </th>
                <th scope="col" className="pb-2 pr-4 font-medium">
                  Duración
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((renta) => (
                <tr key={renta.id_renta} className="border-b border-border/60 align-top last:border-0">
                  <td className="py-2.5 pr-4 font-medium">
                    {renta.nombre_carro}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge className="border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground">
                      {renta.id_carro}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap tabular-nums text-muted-foreground">
                    {formatRango(renta.fecha_inicio, renta.fecha_fin)}
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap text-muted-foreground">
                    {rentalDiasLabel(renta.dias_duracion)}
                  </td>
                  <td className="py-2.5 text-right">
                    <EstadoRentaBadge estado={renta.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}