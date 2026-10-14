import { CheckCircle2, Clock, Flag, Play, XCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { RentalEstado } from '../types/rental.types';
import { RENTA_ESTADO_LABELS } from '../utils/rental.format';

interface RentalEstadoConfig {
  label: string;
  Icon: typeof Clock;
  className: string;
}

const RENTA_ESTADO_CONFIG: Record<RentalEstado, RentalEstadoConfig> = {
  pendiente: {
    label: RENTA_ESTADO_LABELS.pendiente,
    Icon: Clock,
    className: 'border-amber-200/70 bg-amber-100 text-amber-900',
  },
  confirmada: {
    label: RENTA_ESTADO_LABELS.confirmada,
    Icon: CheckCircle2,
    className:
      'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground',
  },
  en_curso: {
    label: RENTA_ESTADO_LABELS.en_curso,
    Icon: Play,
    className: 'border-primary bg-primary text-primary-foreground',
  },
  finalizada: {
    label: RENTA_ESTADO_LABELS.finalizada,
    Icon: Flag,
    className: 'border-border bg-muted text-muted-foreground',
  },
  cancelada: {
    label: RENTA_ESTADO_LABELS.cancelada,
    Icon: XCircle,
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
};

interface RentalStatusBadgeProps {
  estado: RentalEstado;
}

export function RentalStatusBadge({ estado }: RentalStatusBadgeProps) {
  const { label, Icon, className } = RENTA_ESTADO_CONFIG[estado];
  return (
    <Badge className={className}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}