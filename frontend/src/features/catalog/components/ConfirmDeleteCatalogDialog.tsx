import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { CatalogTipo } from '../types/catalog.types';
import { CATALOG_LABELS, catalogErrorMensaje } from '../utils/catalog.format';

export interface CatalogDeleteTarget {
  tipo: CatalogTipo;
  nombre: string;
}

interface ConfirmDeleteCatalogDialogProps {
  target: CatalogDeleteTarget | null;
  isPending: boolean;
  error: unknown;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDeleteCatalogDialog({
  target,
  isPending,
  error,
  onConfirm,
  onOpenChange,
}: ConfirmDeleteCatalogDialogProps) {
  const open = target !== null;
  const labels = target ? CATALOG_LABELS[target.tipo] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-label="Confirmar eliminación">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="size-5" aria-hidden="true" />
            </span>
            {`¿Eliminar ${labels?.singularConArticulo ?? ''} «${target?.nombre ?? ''}»?`}
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Solo se pueden eliminar{' '}
            {labels?.plural ?? ''} sin vehículos asignados.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {catalogErrorMensaje(
              error,
              'No se pudo eliminar. Inténtalo de nuevo.',
            )}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Eliminando…
              </>
            ) : (
              <>Eliminar</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
