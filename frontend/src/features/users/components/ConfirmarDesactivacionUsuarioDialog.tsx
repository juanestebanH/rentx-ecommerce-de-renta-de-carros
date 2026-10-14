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
import type { Usuario } from '../types/users.types';
import { usuarioErrorMensaje } from '../utils/users.format';

interface ConfirmarDesactivacionUsuarioDialogProps {
  usuario: Usuario | null;
  isPending: boolean;
  error: unknown;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmarDesactivacionUsuarioDialog({
  usuario,
  isPending,
  error,
  onConfirm,
  onCancel,
}: ConfirmarDesactivacionUsuarioDialogProps) {
  return (
    <Dialog
      open={usuario !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onCancel();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Dar de baja a {usuario?.nombre}?</DialogTitle>
          <DialogDescription>
            No podrá iniciar sesión en el panel y su sesión activa se cerrará en
            la siguiente petición. Podrás reactivar la cuenta cuando quieras.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {usuarioErrorMensaje(error, 'No se pudo dar de baja al usuario.')}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Dar de baja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
