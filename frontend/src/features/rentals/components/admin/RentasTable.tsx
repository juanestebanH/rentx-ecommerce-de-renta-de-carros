import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ErrorState } from '@/features/reports/components/ErrorState';
import { rentalErrorMensaje } from '../../utils/rental.format';
import type { ResumenRenta } from '../../utils/renta.resumen';
import type { VistaRentas } from './RentasSegmentos';
import { RentaTarjetaMovil } from './RentaTarjetaMovil';
import { RentasColaVacia } from './RentasColaVacia';
import { RentasTableRow } from './RentasTableRow';

const COLUMNAS = [
  'Cliente',
  'Vehículo',
  'Rango',
  'Total esperado',
  'Pago',
  'Estado',
  'Acción',
] as const;

interface RentasTableProps {
  resumenes: ResumenRenta[];
  isLoading: boolean;
  isLoadingPagos: boolean;
  error: unknown;
  onRetry: () => void;
  vista: VistaRentas;
  filterActive: boolean;
  totalRentas: number;
  idRentaSeleccionada: string | null;
  idRentaPendiente: string | null;
  onSelect: (id: string) => void;
  onAccion: (resumen: ResumenRenta) => void;
  onVerTodas: () => void;
}

export function RentasTable({
  resumenes,
  isLoading,
  isLoadingPagos,
  error,
  onRetry,
  vista,
  filterActive,
  totalRentas,
  idRentaSeleccionada,
  idRentaPendiente,
  onSelect,
  onAccion,
  onVerTodas,
}: RentasTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <RentasSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <ErrorState
            message={rentalErrorMensaje(error, 'No se pudieron cargar las rentas.')}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  // La cola en cero es el final feliz de la pantalla: se celebra con la salida
  // al histórico, no con un vacío genérico.
  if (vista === 'accionables' && resumenes.length === 0 && !filterActive) {
    return (
      <Card>
        <CardContent className="p-0">
          <RentasColaVacia totalRentas={totalRentas} onVerTodas={onVerTodas} />
        </CardContent>
      </Card>
    );
  }

  if (resumenes.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-1.5 px-6 text-center">
            <p className="text-sm font-medium">
              {filterActive ? 'Sin resultados' : 'Aún no hay rentas'}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {filterActive
                ? 'Ninguna renta coincide con la búsqueda o los filtros aplicados.'
                : 'Cuando un cliente reserve, aparecerá aquí.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <p aria-live="polite" className="sr-only">
          {isLoadingPagos
            ? 'Actualizando los pagos de las rentas.'
            : `${resumenes.length} rentas en la lista.`}
        </p>

        <div className="relative hidden overflow-x-auto md:block">
          <table className="w-full min-w-[50rem] border-collapse text-sm">
            <caption className="sr-only">
              Rentas con cliente, vehículo, rango de fechas, total esperado,
              pagos, estado y la acción que corresponde
            </caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                {COLUMNAS.map((columna, index) => (
                  <th
                    key={columna}
                    scope="col"
                    className={
                      index === COLUMNAS.length - 1
                        ? 'pb-2 text-right font-medium'
                        : 'pb-2 pr-3 font-medium'
                    }
                  >
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resumenes.map((resumen) => (
                <RentasTableRow
                  key={resumen.renta.id_renta}
                  resumen={resumen}
                  seleccionado={idRentaSeleccionada === resumen.renta.id_renta}
                  pendiente={idRentaPendiente === resumen.renta.id_renta}
                  onSelect={() => onSelect(resumen.renta.id_renta)}
                  onAccion={() => onAccion(resumen)}
                />
              ))}
            </tbody>
          </table>
        </div>

        <ul className="space-y-3 md:hidden">
          {resumenes.map((resumen) => (
            <RentaTarjetaMovil
              key={resumen.renta.id_renta}
              resumen={resumen}
              pendiente={idRentaPendiente === resumen.renta.id_renta}
              onSelect={() => onSelect(resumen.renta.id_renta)}
              onAccion={() => onAccion(resumen)}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RentasSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
        >
          <div className="min-w-0 space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
