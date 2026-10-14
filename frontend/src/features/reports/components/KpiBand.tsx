import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animate, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarCheck,
  CarFront,
  HandCoins,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from 'cn';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCop, formatNumero, mensajeError } from '@/shared/utils/format';
import type { DashboardReport } from '../types/reports.types';
import { ErrorState } from './ErrorState';

type Formateador = (value: number) => string;

function AnimatedValue({ value, format }: { value: number; format: Formateador }) {
  const reduceMotion = useReducedMotion();
  const animated = !reduceMotion;
  const [display, setDisplay] = useState(() => (animated ? 0 : value));

  useEffect(() => {
    if (!animated) {
      return;
    }
    const controls = animate(0, value, {
      duration: 0.4,
      ease: 'easeOut',
      onUpdate: setDisplay,
      onComplete: () => setDisplay(value),
    });
    return () => controls.stop();
  }, [value, animated]);

  return (
    <>
      <span
        aria-hidden="true"
        className="text-4xl font-semibold tracking-tight tabular-nums"
      >
        {format(Math.round(display))}
      </span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

interface KpiTileProps {
  label: string;
  value: number;
  format: Formateador;
  icon: LucideIcon;
  note?: string;
  to?: string;
  anchor?: boolean;
}

function KpiTile({ label, value, format, icon: Icon, note, to, anchor = false }: KpiTileProps) {
  const tileClasses = cn(
    'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    anchor
      ? 'border-transparent bg-primary text-primary-foreground'
      : 'border-border',
  );

  const inner = (
    <>
      <Icon
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -bottom-5 -right-4 size-28',
          anchor ? 'text-primary-foreground/10' : 'text-accent-foreground/[0.05]',
        )}
        strokeWidth={1}
      />
      <div className="relative flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'text-sm',
              anchor ? 'text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-xl',
              anchor
                ? 'bg-white/[0.14] text-primary-foreground'
                : 'bg-[var(--accent-bg)] text-accent-foreground',
            )}
          >
            <Icon className="size-5" />
          </span>
        </div>

        <AnimatedValue value={value} format={format} />

        <div
          className={cn(
            'mt-auto flex items-center gap-1.5 border-t pt-3 text-xs',
            anchor
              ? 'border-white/15 text-primary-foreground'
              : 'border-border/70 text-muted-foreground',
          )}
        >
          {note ? (
            <span>{note}</span>
          ) : to ? (
            <span>Gestionar</span>
          ) : null}
          {to ? (
            <ArrowUpRight
              className="ml-auto size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </>
  );

  return to ? (
    <Link
      to={to}
      className={cn(
        tileClasses,
        anchor
          ? 'hover:bg-primary/90'
          : 'hover:border-[var(--accent-border)]',
      )}
    >
      {inner}
    </Link>
  ) : (
    <div className={tileClasses}>{inner}</div>
  );
}

interface KpiBandProps {
  report?: DashboardReport;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function KpiBand({ report, isLoading, error, onRetry }: KpiBandProps) {
  if (isLoading) {
    return <KpiBandSkeleton />;
  }

  if (error || !report) {
    return (
      <div className="grid gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <ErrorState
            message={mensajeError(error, 'No se pudo cargar el resumen.')}
            onRetry={onRetry}
          />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total de carros',
      value: report.total_carros,
      format: formatNumero,
      icon: CarFront,
      to: '/admin/vehiculos',
    },
    {
      label: 'Clientes activos',
      value: report.total_clientes,
      format: formatNumero,
      icon: Users,
      to: '/admin/clientes',
    },
    {
      label: 'Rentas activas',
      value: report.rentas_activas,
      format: formatNumero,
      icon: CalendarCheck,
      note: 'En este momento',
      to: '/admin/rentas',
    },
    {
      label: 'Ingresos del mes',
      value: report.ingresos_mes,
      format: formatCop,
      icon: HandCoins,
      note: 'Mes en curso',
      anchor: true,
      to: '/admin/reportes',
    },
  ] satisfies KpiTileProps[];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiTile key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}

export function KpiBandSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-10 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-28" />
          <Skeleton className="mt-auto h-4 w-24" />
        </div>
      ))}
    </div>
  );
}