import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import type { CatalogTipo } from '../types/catalog.types';
import { CATALOG_LABELS, catalogErrorMensaje } from '../utils/catalog.format';

interface CatalogEntryDialogProps {
  open: boolean;
  modo: 'crear' | 'editar';
  tipo: CatalogTipo;
  nombre: string;
  onNombreChange: (nombre: string) => void;
  isPending: boolean;
  error: unknown;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
}

const PLACEHOLDER: Record<CatalogTipo, string> = {
  marcas: 'Ej. Toyota, Kia, Renault…',
  categorias: 'Ej. SUV, Sedán, Camioneta…',
};

export function CatalogEntryDialog({
  open,
  modo,
  tipo,
  nombre,
  onNombreChange,
  isPending,
  error,
  onSubmit,
  onOpenChange,
}: CatalogEntryDialogProps) {
  const labels = CATALOG_LABELS[tipo];
  const esCrear = modo === 'crear';
  const valido = nombre.trim().length > 0;
  const titulo = esCrear
    ? `Nueva ${labels.singular}`
    : `Editar ${labels.singular}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-label={titulo}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (valido && !isPending) onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogDescription>
              {esCrear
                ? 'El nombre se guarda en minúsculas y queda disponible al editar un vehículo.'
                : `Actualiza el nombre de ${labels.singularConArticulo}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex flex-col gap-1.5">
            <label
              htmlFor="catalog-nombre"
              className="text-sm font-medium text-foreground"
            >
              Nombre
            </label>
            <Input
              id="catalog-nombre"
              value={nombre}
              autoFocus
              maxLength={60}
              disabled={isPending}
              placeholder={PLACEHOLDER[tipo]}
              onChange={(event) => onNombreChange(event.target.value)}
              aria-invalid={!valido && nombre.length > 0}
            />
            {!valido && nombre.length > 0 ? (
              <p className="text-xs text-destructive">
                El nombre no puede estar vacío.
              </p>
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {catalogErrorMensaje(
                error,
                `No se pudo guardar ${labels.singularConArticulo}. Inténtalo de nuevo.`,
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
            <Button type="submit" disabled={!valido || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Guardando…
                </>
              ) : esCrear ? (
                <>Crear {labels.singular}</>
              ) : (
                <>Guardar cambios</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
