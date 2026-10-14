import { Skeleton } from '@/shared/components/ui/skeleton';
import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { formatCop, formatNumero, mensajeError } from '@/shared/utils/format';
import type { RankingVehiculosReporte } from '../types/reports.types';
import { porcentajeSobreTotal } from '../utils/reporte.format';
import { ErrorState } from './ErrorState';
import { RankingVehiculoTarjetaMovil } from './RankingVehiculoTarjetaMovil';

interface RankingVehiculosTableProps {
  reporte?: RankingVehiculosReporte;
  totalIngresosPeriodo: number;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function RankingVehiculosTable({
  reporte,
  totalIngresosPeriodo,
  isLoading,
  error,
  onRetry,
}: RankingVehiculosTableProps) {
  if (isLoading) return <TablaSkeleton />;

  if (error || !reporte) {
    return (
      <ErrorState
        message={mensajeError(error, 'No se pudo cargar el ranking de vehículos.')}
        onRetry={onRetry}
      />
    );
  }

  if (reporte.items.length === 0) {
    return (
      <p className="grid h-40 place-items-center text-sm text-muted-foreground">
        Este periodo no tiene rentas finalizadas.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <caption className="sr-only">
            Vehículos con más ingresos en el periodo: categoría, rentas,
            días rentados, ingresos y porcentaje sobre el total del periodo
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">
                Vehículo
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Categoría
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">
                Rentas
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">
                Días rentados
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">
                Ingresos
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                % del periodo
              </th>
            </tr>
          </thead>
          <tbody>
            {reporte.items.map((item) => (
              <tr key={item.id_carro} className="border-b border-border/60 last:border-0">
                <th scope="row" className="py-3 pr-3 text-left font-normal">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">
                      {item.nombre ?? item.id_carro}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {item.id_marca ?? '—'}
                    </span>
                  </span>
                </th>
                <td className="py-3 pr-3 text-muted-foreground">
                  {item.id_categoria ? categoriaLabel(item.id_categoria) : '—'}
                </td>
                <td className="py-3 pr-3 text-right tabular-nums">
                  {formatNumero(item.rentas)}
                </td>
                <td className="py-3 pr-3 text-right tabular-nums text-muted-foreground">
                  {formatNumero(Math.round(item.dias_rentados))}
                </td>
                <td className="py-3 pr-3 text-right font-medium tabular-nums">
                  {formatCop(item.ingresos)}
                </td>
                <td className="py-3 text-right tabular-nums text-muted-foreground">
                  {formatNumero(
                    porcentajeSobreTotal(item.ingresos, totalIngresosPeriodo),
                  )}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {reporte.items.map((item) => (
          <RankingVehiculoTarjetaMovil
            key={item.id_carro}
            item={item}
            totalIngresosPeriodo={totalIngresosPeriodo}
          />
        ))}
      </ul>
    </>
  );
}

function TablaSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-4 flex-2" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}