import { Loader2, XCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import type { Rental } from '../types/rental.types';
import {
  formatRentalFechas,
  rentalDiasLabel,
  rentalErrorMensaje,
} from '../utils/rental.format';

interface CancelRentalDialogProps {
  rental: Rental | null;
  isPending: boolean;
  error: unknown;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function CancelRentalDialog({
  rental,
  isPending,
  error,
  onConfirm,
  onOpenChange,
}: CancelRentalDialogProps) {
  const open = Boolean(rental);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¿Cancelar esta renta?</DialogTitle>
          <DialogDescription>
            {rental ? (
              <>
                Del {formatRentalFechas(rental.fecha_inicio)} al{' '}
                {formatRentalFechas(rental.fecha_fin)} (
                {rentalDiasLabel(rental.dias_duracion)}). La cancelación no se
                puede deshacer.
              </>
            ) : (
              'La renta quedará cancelada. Esta acción no se puede deshacer.'
            )}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {rentalErrorMensaje(error, 'No se pudo cancelar la renta. Inténtalo de nuevo.')}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Mantener renta
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Cancelando…
              </>
            ) : (
              <>
                <XCircle aria-hidden="true" />
                Cancelar renta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}