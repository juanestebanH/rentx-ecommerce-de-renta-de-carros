import { BadgeCheck, Clock, Minus, TriangleAlert } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import {
  formatFechaLicencia,
  licenciaEstado,
  type LicenciaVigencia,
} from '../utils/clients.format';

const VIGENCIA_CONFIG: Record<
  LicenciaVigencia,
  { label: string; Icon: typeof Clock; className: string }
> = {
  vigente: {
    label: 'Vigente',
    Icon: BadgeCheck,
    className:
      'border-[var(--accent-border)] bg-[var(--accent-bg)] text-accent-foreground',
  },
  pronto: {
    label: 'Vence pronto',
    Icon: Clock,
    className: 'border-amber-200/70 bg-amber-100 text-amber-900',
  },
  vencida: {
    label: 'Vencida',
    Icon: TriangleAlert,
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  sin_vencimiento: {
    label: 'Sin vencimiento',
    Icon: Minus,
    className: 'border-border bg-muted text-muted-foreground',
  },
};

interface LicenciaBadgeProps {
  numero_licencia: string;
  fecha_vencimiento: string | null;
}

export function LicenciaBadge({
  numero_licencia,
  fecha_vencimiento,
}: LicenciaBadgeProps) {
  const vigencia = licenciaEstado(fecha_vencimiento);
  const { label, Icon, className } = VIGENCIA_CONFIG[vigencia];

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate font-medium tabular-nums">
        {numero_licencia}
      </span>
      <Badge className={className} title={formatFechaLicencia(fecha_vencimiento)}>
        <Icon aria-hidden="true" />
        {label}
      </Badge>
    </div>
  );
}