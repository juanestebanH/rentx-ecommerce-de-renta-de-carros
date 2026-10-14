import { Ban, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { ClienteEstado } from '../types/clients.types';

const ESTADO_CONFIG: Record<ClienteEstado, { label: string; Icon: typeof CheckCircle2; className: string }> = {
  activo: {
    label: 'Activo',
    Icon: CheckCircle2,
    className:
      'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground',
  },
  inactivo: {
    label: 'Inactivo',
    Icon: Ban,
    className: 'border-border bg-muted text-muted-foreground',
  },
};

interface EstadoClienteBadgeProps {
  estado: ClienteEstado;
}

export function EstadoClienteBadge({ estado }: EstadoClienteBadgeProps) {
  const { label, Icon, className } = ESTADO_CONFIG[estado];
  return (
    <Badge className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}