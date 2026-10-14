import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { mensajeError } from '@/shared/utils/format';
import { ErrorState } from '@/features/reports/components/ErrorState';
import type { CatalogEntry, CatalogTipo } from '../types/catalog.types';
import { CATALOG_LABELS } from '../utils/catalog.format';
import { CatalogTableRow } from './CatalogTableRow';
import { CatalogTarjetaMovil } from './CatalogTarjetaMovil';

interface CatalogTableProps {
  tipo: CatalogTipo;
  entries: CatalogEntry[];
  counts: Map<string, number>;
  countsReady: boolean;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  actionsDisabled: boolean;
  onEdit: (entry: CatalogEntry) => void;
  onDelete: (entry: CatalogEntry) => void;
}

export function CatalogTable({
  tipo,
  entries,
  counts,
  countsReady,
  isLoading,
  error,
  onRetry,
  actionsDisabled,
  onEdit,
  onDelete,
}: CatalogTableProps) {
  const labels = CATALOG_LABELS[tipo];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.tituloPlural}</CardTitle>
        <CardDescription>
          {labels.tituloPlural} disponibles al registrar o editar un vehículo.
          El número indica cuántos vehículos la usan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CatalogSkeleton />
        ) : error ? (
          <ErrorState
            message={mensajeError(
              error,
              `No se pudieron cargar las ${labels.plural}.`,
            )}
            onRetry={onRetry}
          />
        ) : entries.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium">
                Aún no hay {labels.plural} registradas
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Crea la primera para que aparezca al editar un vehículo.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative hidden overflow-x-auto md:block">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <caption className="sr-only">
                  {labels.tituloPlural} con su uso y acciones de editar o
                  eliminar
                </caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Nombre
                    </th>
                    <th scope="col" className="pb-2 pr-4 font-medium">
                      Vehículos
                    </th>
                    <th scope="col" className="pb-2 text-right font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <CatalogTableRow
                      key={entry.nombre}
                      entry={entry}
                      uso={counts.get(entry.nombre) ?? 0}
                      labelSingular={labels.singular}
                      countsReady={countsReady}
                      actionsDisabled={actionsDisabled}
                      onEdit={() => onEdit(entry)}
                      onDelete={() => onDelete(entry)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {entries.map((entry) => (
                <CatalogTarjetaMovil
                  key={entry.nombre}
                  entry={entry}
                  uso={counts.get(entry.nombre) ?? 0}
                  labelSingular={labels.singular}
                  countsReady={countsReady}
                  actionsDisabled={actionsDisabled}
                  onEdit={() => onEdit(entry)}
                  onDelete={() => onDelete(entry)}
                />
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CatalogSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
        >
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
