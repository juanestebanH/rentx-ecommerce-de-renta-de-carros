import type { CatalogEntry } from '../types/catalog.types';
import { CatalogRowActions } from './CatalogRowActions';

interface CatalogTarjetaMovilProps {
  entry: CatalogEntry;
  uso: number;
  labelSingular: string;
  countsReady: boolean;
  actionsDisabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CatalogTarjetaMovil({
  entry,
  uso,
  labelSingular,
  countsReady,
  actionsDisabled,
  onEdit,
  onDelete,
}: CatalogTarjetaMovilProps) {
  const usoLabel = uso === 1 ? 'vehículo' : 'vehículos';

  return (
    <li className="rounded-lg border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{entry.nombre}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {uso > 0
              ? `En uso por ${uso} ${usoLabel}`
              : 'Sin vehículos asignados'}
          </p>
        </div>
        <CatalogRowActions
          nombre={entry.nombre}
          labelSingular={labelSingular}
          uso={uso}
          countsReady={countsReady}
          actionsDisabled={actionsDisabled}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </li>
  );
}
