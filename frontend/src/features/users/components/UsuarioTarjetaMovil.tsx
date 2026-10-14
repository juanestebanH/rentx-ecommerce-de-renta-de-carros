import { cn } from 'cn';
import type { Usuario } from '../types/users.types';
import { inicialesDe } from '../utils/users.format';
import { UsuarioAccionesMenu } from './UsuarioAccionesMenu';
import { UsuarioEstadoBadge } from './UsuarioEstadoBadge';

interface UsuarioTarjetaMovilProps {
  usuario: Usuario;
  esUsuarioActual: boolean;
  estadoPending: boolean;
  puedeDesactivar: boolean;
  motivoDesactivar: string;
  onEdit: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}

export function UsuarioTarjetaMovil({
  usuario,
  esUsuarioActual,
  estadoPending,
  puedeDesactivar,
  motivoDesactivar,
  onEdit,
  onDeactivate,
  onActivate,
}: UsuarioTarjetaMovilProps) {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
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
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {usuario.email}
            </p>
          </div>
        </div>
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

      <div className="mt-3 flex items-center justify-between gap-3">
        <UsuarioEstadoBadge estado={usuario.estado} />
        <span
          className="max-w-[60%] truncate font-mono text-xs text-muted-foreground"
          title={usuario.id_usuario}
        >
          {usuario.id_usuario}
        </span>
      </div>
    </li>
  );
}
