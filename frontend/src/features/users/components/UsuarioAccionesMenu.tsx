import { MoreHorizontal, Pencil, RotateCcw, UserX } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface UsuarioAccionesMenuProps {
  nombre: string;
  activo: boolean;
  puedeDesactivar: boolean;
  motivoDesactivar: string;
  disabled: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

export function UsuarioAccionesMenu({
  nombre,
  activo,
  puedeDesactivar,
  motivoDesactivar,
  disabled,
  onEdit,
  onDeactivate,
  onActivate,
}: UsuarioAccionesMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Acciones para ${nombre}`}
          className="text-muted-foreground"
          disabled={disabled}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {activo ? (
          <>
            <DropdownMenuItem
              variant="destructive"
              disabled={!puedeDesactivar}
              onSelect={puedeDesactivar ? onDeactivate : undefined}
            >
              <UserX />
              Dar de baja
            </DropdownMenuItem>
            {!puedeDesactivar ? (
              <p className="px-2 pt-1 pb-1.5 text-xs leading-snug text-muted-foreground">
                {motivoDesactivar}
              </p>
            ) : null}
          </>
        ) : (
          <DropdownMenuItem onSelect={onActivate}>
            <RotateCcw />
            Reactivar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
