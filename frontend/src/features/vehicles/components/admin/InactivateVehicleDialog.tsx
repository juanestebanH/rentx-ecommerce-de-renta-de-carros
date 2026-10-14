import { Ban, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { Vehicle } from '../../types/vehicle.types';
import { vehicleErrorMensaje } from '../../utils/vehicle.format';

interface InactivateVehicleDialogProps {
  open: boolean;
  vehicle: Vehicle | null;
  isPending: boolean;
  error: unknown;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function InactivateVehicleDialog({
  open,
  vehicle,
  isPending,
  error,
  onConfirm,
  onOpenChange,
}: InactivateVehicleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" aria-label="Marcar vehículo como inactivo">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Ban className="size-5" aria-hidden="true" />
            </span>
            ¿Marcar {vehicle?.nombre} como inactivo?
          </DialogTitle>
          <DialogDescription>
            {vehicle ? (
              <span className="block text-sm text-muted-foreground">
                El vehículo{' '}
                <span className="font-semibold text-foreground">
                  {vehicle.nombre} · {vehicle.id_carro}
                </span>{' '}
                dejará de estar disponible para nuevos alquileres, pero su
                historial y sus datos se conservan. Podrás reactivarlo cuando
                quieras.
              </span>
            ) : (
              'El vehículo dejará de estar disponible para nuevos alquileres, pero su historial se conserva.'
            )}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {vehicleErrorMensaje(
              error,
              'No se pudo marcar el vehículo como inactivo. Inténtalo de nuevo.',
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
                Marcando…
              </>
            ) : (
              <>
                <Ban className="size-4" aria-hidden="true" />
                Marcar inactivo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}