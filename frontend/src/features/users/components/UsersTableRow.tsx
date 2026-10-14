import { cn } from 'cn';
import type { Usuario } from '../types/users.types';
import { inicialesDe } from '../utils/users.format';
import { UsuarioAccionesMenu } from './UsuarioAccionesMenu';
import { UsuarioEstadoBadge } from './UsuarioEstadoBadge';

interface UsersTableRowProps {
  usuario: Usuario;
  esUsuarioActual: boolean;
  estadoPending: boolean;
  puedeDesactivar: boolean;
  motivoDesactivar: string;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

export function UsersTableRow({
  usuario,
  esUsuarioActual,
  estadoPending,
  puedeDesactivar,
  motivoDesactivar,
  onEdit,
  onDeactivate,
  onActivate,
}: UsersTableRowProps) {
  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="py-3 pr-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              esUsuarioActual
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            {inicialesDe(usuario.nombre)}
          </span>
          <div className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate font-medium">{usuario.nombre}</span>
              {esUsuarioActual ? (
                <span className="shrink-0 rounded-full bg-[var(--accent-bg)] px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                  Tú
                </span>
              ) : null}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {usuario.email}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        <span
          className="block max-w-[12rem] truncate font-mono text-xs text-muted-foreground"
          title={usuario.id_usuario}
        >
          {usuario.id_usuario}
        </span>
      </td>
      <td className="py-3 pr-4">
        <UsuarioEstadoBadge estado={usuario.estado} />
      </td>
      <td className="py-3">
        <div className="flex items-center justify-end">
          <UsuarioAccionesMenu
            nombre={usuario.nombre}
            activo={usuario.estado === 'activo'}
            puedeDesactivar={puedeDesactivar}
            motivoDesactivar={motivoDesactivar}
            disabled={estadoPending}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            onActivate={onActivate}
          />
        </div>
      </td>
    </tr>
  );
}
