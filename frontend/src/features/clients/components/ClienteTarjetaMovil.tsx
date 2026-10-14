import { History } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Client } from '../types/clients.types';
import { EstadoClienteBadge } from './EstadoClienteBadge';
import { EstadoToggle } from './EstadoToggle';
import { LicenciaBadge } from './LicenciaBadge';

interface ClienteTarjetaMovilProps {
  client: Client;
  estadoPending: boolean;
  onToggleEstado: () => void;
  onViewHistory: () => void;
}

export function ClienteTarjetaMovil({
  client,
  estadoPending,
  onToggleEstado,
  onViewHistory,
}: ClienteTarjetaMovilProps) {
  const nombreCompleto = `${client.nombres} ${client.apellidos}`;
  const contacto = [client.email, client.telefono].filter(Boolean).join(' · ');
  const activo = client.estado === 'activo';

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{nombreCompleto}</p>
          {contacto && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {contacto}
            </p>
          )}
        </div>
        <EstadoClienteBadge estado={client.estado} />
      </div>

      <div className="mt-3">
        <LicenciaBadge
          numero_licencia={client.numero_licencia}
          fecha_vencimiento={client.fecha_vencimiento}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <EstadoToggle
            estado={client.estado}
            busy={estadoPending}
            ariaLabel={`${activo ? 'Desactivar' : 'Activar'} a ${nombreCompleto}`}
            onToggle={onToggleEstado}
          />
          <span className="text-sm text-muted-foreground">
            {activo ? 'Desactivar' : 'Activar'}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={onViewHistory}>
          <History className="size-4" aria-hidden="true" />
          Historial
        </Button>
      </div>
    </li>
  );
}
