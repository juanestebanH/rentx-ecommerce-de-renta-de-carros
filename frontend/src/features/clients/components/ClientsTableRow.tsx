import { History } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Client } from '../types/clients.types';
import { EstadoClienteBadge } from './EstadoClienteBadge';
import { EstadoToggle } from './EstadoToggle';
import { LicenciaBadge } from './LicenciaBadge';

interface ClientsTableRowProps {
  client: Client;
  estadoPending: boolean;
  onToggleEstado: () => void;
  onViewHistory: () => void;
}

export function ClientsTableRow({
  client,
  estadoPending,
  onToggleEstado,
  onViewHistory,
}: ClientsTableRowProps) {
  const nombreCompleto = `${client.nombres} ${client.apellidos}`;
  const contacto = [client.email, client.telefono].filter(Boolean).join(' · ');

  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="py-3 pr-4">
        <span className="font-medium">{nombreCompleto}</span>
        {contacto && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {contacto}
          </span>
        )}
      </td>
      <td className="py-3 pr-4">
        <LicenciaBadge
          numero_licencia={client.numero_licencia}
          fecha_vencimiento={client.fecha_vencimiento}
        />
      </td>
      <td className="py-3 pr-4">
        <EstadoClienteBadge estado={client.estado} />
      </td>
      <td className="py-3">
        <div className="flex items-center justify-end gap-1">
          <EstadoToggle
            estado={client.estado}
            busy={estadoPending}
            ariaLabel={`${client.estado === 'activo' ? 'Desactivar' : 'Activar'} a ${nombreCompleto}`}
            onToggle={onToggleEstado}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onViewHistory}
            aria-label={`Ver historial de rentas de ${nombreCompleto}`}
            title="Ver historial de rentas"
            className="text-muted-foreground"
          >
            <History className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </td>
    </tr>
  );
}