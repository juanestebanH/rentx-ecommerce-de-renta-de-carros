import { Pencil, Trash2 } from 'lucide-react';
import { cn } from 'cn';

interface CatalogRowActionsProps {
  nombre: string;
  labelSingular: string;
  uso: number;
  countsReady: boolean;
  actionsDisabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const BOTON_BASE =
  'flex size-8 items-center justify-center rounded-md transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50';

export function CatalogRowActions({
  nombre,
  labelSingular,
  uso,
  countsReady,
  actionsDisabled,
  onEdit,
  onDelete,
}: CatalogRowActionsProps) {
  const usoLabel = uso === 1 ? 'vehículo' : 'vehículos';
  const deleteTitle =
    uso > 0
      ? `En uso por ${uso} ${usoLabel}`
      : !countsReady
        ? 'Cargando el uso de vehículos…'
        : `Eliminar ${labelSingular}`;
  const deleteDisabled = actionsDisabled || !countsReady || uso > 0;

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        disabled={actionsDisabled}
        aria-label={`Editar ${nombre}`}
        title={`Editar ${labelSingular}`}
        className={cn(
          BOTON_BASE,
          'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleteDisabled}
        aria-label={`Eliminar ${nombre}`}
        title={deleteTitle}
        className={cn(
          BOTON_BASE,
          'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
        )}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
