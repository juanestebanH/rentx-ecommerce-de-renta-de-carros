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
import type { Client } from '../types/clients.types';

interface ConfirmarDesactivacionDialogProps {
  client: Client | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmarDesactivacionDialog({
  client,
  isPending,
  onConfirm,
  onCancel,
}: ConfirmarDesactivacionDialogProps) {
  const nombreCompleto = client ? `${client.nombres} ${client.apellidos}` : '';

  return (
    <Dialog
      open={client !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Desactivar a {nombreCompleto}?</DialogTitle>
          <DialogDescription>
            No podrá reservar vehículos ni tener rentas en curso hasta que lo
            vuelvas a activar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Desactivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}