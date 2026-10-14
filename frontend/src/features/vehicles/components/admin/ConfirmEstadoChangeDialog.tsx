import { Ban, Loader2, Wrench } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from 'cn';
import type { VehicleEstado } from '../../types/vehicle.types';
import { vehicleErrorMensaje } from '../../utils/vehicle.format';

export interface EstadoConfirmTarget {
  id: string;
  nombre: string;
  nextEstado: VehicleEstado;
}

interface ConfirmEstadoChangeDialogProps {
  target: EstadoConfirmTarget | null;
  isPending: boolean;
  error: unknown;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmEstadoChangeDialog({
  target,
  isPending,
  error,
  onConfirm,
  onOpenChange,
}: ConfirmEstadoChangeDialogProps) {
  const open = target !== null;
  const inMantenimiento = target?.nextEstado === 'mantenimiento';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-label="Confirmar cambio de estado">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-9 items-center justify-center rounded-full',
                inMantenimiento
                  ? 'bg-amber-600/10 text-amber-700'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              {inMantenimiento ? (
                <Wrench className="size-5" aria-hidden="true" />
              ) : (
                <Ban className="size-5" aria-hidden="true" />
              )}
            </span>
            {inMantenimiento
              ? `¿Marcar ${target?.nombre} en mantenimiento?`
              : `¿Marcar ${target?.nombre} como inactivo?`}
          </DialogTitle>
          <DialogDescription>
            {inMantenimiento
              ? 'Se ocultará del catálogo público hasta que vuelva a estar activo.'
              : 'Se retirará de la flota permanentemente, pero su historial de rentas se conserva.'}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {vehicleErrorMensaje(
              error,
              'No se pudo cambiar el estado. Inténtalo de nuevo.',
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
            variant={inMantenimiento ? 'default' : 'destructive'}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Marcando…
              </>
            ) : inMantenimiento ? (
              <>Marcar en mantenimiento</>
            ) : (
              <>Marcar inactivo</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}