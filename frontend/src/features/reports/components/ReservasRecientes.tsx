import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatRango, mensajeError } from '@/shared/utils/format';
import { rentalDiasLabel } from '@/features/rentals/utils/rental.format';
import type { RentaReciente } from '../types/reports.types';
import { ErrorState } from './ErrorState';
import { EstadoRentaBadge } from './EstadoRentaBadge';

interface ReservasRecientesProps {
  data?: RentaReciente[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function ReservasRecientes({
  data,
  isLoading,
  error,
  onRetry,
}: ReservasRecientesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservas recientes</CardTitle>
        <CardDescription>Últimas rentas registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ReservasSkeleton />
        ) : error || !data ? (
          <ErrorState
            message={mensajeError(error, 'No se pudieron cargar las reservas.')}
            onRetry={onRetry}
          />
        ) : data.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium">Sin reservas todavía</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cuando un cliente reserve, aparecerá aquí.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">
                Reservas recientes con cliente, carro, rango de fechas,
                duración y estado
              </caption>
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    Cliente
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    Carro
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
                  <tr
                    key={renta.id_renta}
                    className="border-b border-border/60 align-top last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {renta.cliente
                        ? `${renta.cliente.nombres} ${renta.cliente.apellidos}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {renta.carro?.nombre ?? (
                        <span className="italic text-muted-foreground">
                          Carro eliminado
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap tabular-nums text-muted-foreground">
                      {formatRango(renta.fecha_inicio, renta.fecha_fin)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {rentalDiasLabel(renta.dias_duracion)}
                    </td>
                    <td className="py-3 text-right">
                      <EstadoRentaBadge estado={renta.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReservasSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}