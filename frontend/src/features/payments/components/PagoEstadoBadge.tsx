import { BadgeCheck, CircleDashed, CircleX, Undo2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { PagoEstado } from '../types/payment.types';
import { PAGO_ESTADO_LABELS } from '../utils/payment.format';

const PAGO_ESTADO_CONFIG: Record<PagoEstado, { Icon: typeof CircleDashed; className: string }> = {
  completado: {
    Icon: BadgeCheck,
    className:
      'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground',
  },
  pendiente: {
    Icon: CircleDashed,
    className: 'border-amber-200/70 bg-amber-100 text-amber-900',
  },
  fallido: {
    Icon: CircleX,
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  reembolsado: {
    Icon: Undo2,
    className: 'border-border bg-muted text-muted-foreground',
  },
};

interface PagoEstadoBadgeProps {
  estado: PagoEstado;
}

export function PagoEstadoBadge({ estado }: PagoEstadoBadgeProps) {
  const { Icon, className } = PAGO_ESTADO_CONFIG[estado];
  return (
    <Badge className={className}>
      <Icon aria-hidden="true" />
      {PAGO_ESTADO_LABELS[estado]}
    </Badge>
  );
}
