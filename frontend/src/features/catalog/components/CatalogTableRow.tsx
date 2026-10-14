import { cn } from 'cn';
import type { CatalogEntry } from '../types/catalog.types';
import { CatalogRowActions } from './CatalogRowActions';

interface CatalogTableRowProps {
  entry: CatalogEntry;
  uso: number;
  labelSingular: string;
  countsReady: boolean;
  actionsDisabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CatalogTableRow({
  entry,
  uso,
  labelSingular,
  countsReady,
  actionsDisabled,
  onEdit,
  onDelete,
}: CatalogTableRowProps) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2.5 pr-4 font-medium text-foreground">{entry.nombre}</td>
      <td className="py-2.5 pr-4">
        <span
          className={cn(
            'inline-flex min-w-7 justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
            uso > 0
              ? 'bg-[var(--accent-bg)] text-accent-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {uso}
        </span>
      </td>
      <td className="py-2.5">
        <CatalogRowActions
          nombre={entry.nombre}
          labelSingular={labelSingular}
          uso={uso}
          countsReady={countsReady}
          actionsDisabled={actionsDisabled}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
