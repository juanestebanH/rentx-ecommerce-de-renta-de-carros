import {
  CalendarCheck,
  Gauge,
  HandCoins,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
import { cn } from 'cn';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { mensajeError } from '@/shared/utils/format';
import type { KpiPeriodo, ResumenPeriodo } from '../types/reports.types';
import {
  etiquetaComparacion,
  formatKpiValor,
  variacionKpi,
  type FormatoKpi,
} from '../utils/reporte.format';
import { ErrorState } from './ErrorState';

interface KpiDef {
  key: keyof Pick<
    ResumenPeriodo,
    'ingresos' | 'rentas_finalizadas' | 'ticket_promedio' | 'ocupacion'
  >;
  label: string;
  formato: FormatoKpi;
  icon: LucideIcon;
}

const KPIS: KpiDef[] = [
  { key: 'ingresos', label: 'Ingresos', formato: 'cop', icon: HandCoins },
  {
    key: 'rentas_finalizadas',
    label: 'Rentas finalizadas',
    formato: 'numero',
    icon: CalendarCheck,
  },
  {
    key: 'ticket_promedio',
    label: 'Ticket promedio',
    formato: 'cop',
    icon: ReceiptText,
  },
  { key: 'ocupacion', label: 'Ocupación', formato: 'porcentaje', icon: Gauge },
];

const TONO_DIRECCION = {
  sube: 'text-accent-foreground',
  baja: 'text-destructive',
  empata: 'text-muted-foreground',
  'sin-datos': 'text-muted-foreground',
} as const;

interface ReportesKpisProps {
  data?: ResumenPeriodo;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function ReportesKpis({ data, isLoading, error, onRetry }: ReportesKpisProps) {
  if (isLoading) {
    return <KpisSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <ErrorState
          message={mensajeError(error, 'No se pudieron cargar los indicadores.')}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <section aria-label="Indicadores del periodo" className="space-y-2">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map(({ key, label, formato, icon: Icon }) => (
          <KpiTile
            key={key}
            label={label}
            formato={formato}
            icon={Icon}
            kpi={data[key]}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Comparados contra {etiquetaComparacion(data.periodo_anterior)}
      </p>
    </section>
  );
}

interface KpiTileProps {
  label: string;
  formato: FormatoKpi;
  icon: LucideIcon;
  kpi: KpiPeriodo;
}

function KpiTile({ label, formato, icon: Icon, kpi }: KpiTileProps) {
  const variacion = variacionKpi(kpi);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-bg)] text-accent-foreground"
        >
          <Icon className="size-5" />
        </span>
      </div>

      <p className="my-0 text-3xl font-semibold tracking-tight tabular-nums">
        {formatKpiValor(kpi.actual, formato)}
      </p>

      <p className="mt-auto flex items-center gap-2 border-t border-border/70 pt-3 text-xs">
        <span
          className={cn(
            'font-medium tabular-nums',
            TONO_DIRECCION[variacion.direccion],
          )}
        >
          {variacion.texto}
        </span>
        <span className="text-muted-foreground">
          anterior: {formatKpiValor(kpi.anterior, formato)}
        </span>
      </p>
    </div>
  );
}

function KpisSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPIS.map(({ key, label }) => (
        <div
          key={key}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-auto h-4 w-40" />
          <span className="sr-only">{label}</span>
        </div>
      ))}
    </div>
  );
}