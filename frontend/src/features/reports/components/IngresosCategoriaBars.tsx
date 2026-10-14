import { categoriaLabel } from '@/shared/utils/catalogo.format';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCop, formatNumero, mensajeError } from '@/shared/utils/format';
import type { IngresosCategoriasReporte } from '../types/reports.types';
import { porcentajeSobreTotal } from '../utils/reporte.format';
import { ErrorState } from './ErrorState';

interface IngresosCategoriaBarsProps {
  reporte?: IngresosCategoriasReporte;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function IngresosCategoriaBars({
  reporte,
  isLoading,
  error,
  onRetry,
}: IngresosCategoriaBarsProps) {
  if (isLoading) return <BarrasSkeleton />;

  if (error || !reporte) {
    return (
      <ErrorState
        message={mensajeError(error, 'No se pudieron cargar los ingresos por categoría.')}
        onRetry={onRetry}
      />
    );
  }

  if (reporte.items.length === 0) {
    return (
      <p className="grid h-40 place-items-center text-sm text-muted-foreground">
        Este periodo no tiene ingresos por categoría.
      </p>
    );
  }

  const maximo = Math.max(...reporte.items.map((item) => item.ingresos), 0);

  return (
    <ul className="min-w-0 space-y-4">
      {reporte.items.map((item) => {
        const porcentaje = porcentajeSobreTotal(item.ingresos, reporte.total_ingresos);
        const etiqueta = item.id_categoria
          ? categoriaLabel(item.id_categoria)
          : 'Sin categoría';

        return (
          <li key={item.id_categoria} className="min-w-0 space-y-1.5">
            <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium" title={etiqueta}>
                {etiqueta}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatNumero(porcentaje)}% ·{' '}
                {formatNumero(item.rentas)}{' '}
                {item.rentas === 1 ? 'renta' : 'rentas'}
              </span>
            </div>
            <div
              role="meter"
              aria-valuenow={porcentaje}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Ingresos de ${etiqueta}`}
              className="h-2 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{
                  width: maximo > 0 ? `${(item.ingresos / maximo) * 100}%` : '0%',
                }}
              />
            </div>
            <p className="text-sm font-medium tabular-nums">
              {formatCop(item.ingresos)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

const FILAS_SKELETON = [0, 1, 2];

function BarrasSkeleton() {
  return (
    <div className="min-w-0 space-y-4">
      {FILAS_SKELETON.map((fila) => (
        <div key={fila} className="min-w-0 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}