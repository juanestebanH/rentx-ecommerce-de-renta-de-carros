import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/shared/components/ui/chart';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { formatCop, formatNumero, mensajeError } from '@/shared/utils/format';
import type { AgruparPor, IngresoTiempoPunto } from '../types/reports.types';
import { formatEjeCompact } from '../utils/report.format';
import { detalleBucket, etiquetaBucket } from '../utils/reporte.format';
import { ErrorState } from './ErrorState';

const CONFIG: ChartConfig = {
  ingresos: { label: 'Ingresos', color: 'var(--color-primary)' },
};

interface PuntoGrafica extends IngresoTiempoPunto {
  etiqueta: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: PuntoGrafica }[];
  agrupar: AgruparPor;
}

function TooltipPeriodo({ active, payload, agrupar }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;

  return (
    <div className="grid min-w-[11rem] gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl">
      <p className="font-medium">{detalleBucket(punto, agrupar)}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-2.5 shrink-0 rounded-[2px] bg-primary"
          />
          Ingresos
        </span>
        <span className="font-medium tabular-nums">{formatCop(punto.ingresos)}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">Rentas</span>
        <span className="font-medium tabular-nums">
          {formatNumero(punto.rentas)}
        </span>
      </div>
    </div>
  );
}

interface IngresosPeriodoChartProps {
  puntos: IngresoTiempoPunto[];
  agrupar: AgruparPor;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function IngresosPeriodoChart({
  puntos,
  agrupar,
  isLoading,
  error,
  onRetry,
}: IngresosPeriodoChartProps) {
  const datos = useMemo<PuntoGrafica[]>(
    () =>
      puntos.map((punto) => ({
        ...punto,
        etiqueta: etiquetaBucket(punto.periodo, agrupar),
      })),
    [puntos, agrupar],
  );

  if (isLoading) return <ChartSkeleton />;

  if (error) {
    return (
      <ErrorState
        message={mensajeError(error, 'No se pudo cargar la serie de ingresos.')}
        onRetry={onRetry}
      />
    );
  }

  if (datos.length === 0) {
    return (
      <p className="grid h-72 place-items-center text-sm text-muted-foreground">
        Este periodo no tiene datos de ingresos.
      </p>
    );
  }

  return (
    <ChartContainer config={CONFIG} className="h-72 w-full">
      <BarChart
        data={datos}
        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        barCategoryGap="20%"
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="etiqueta"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={4}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={60}
          tickFormatter={formatEjeCompact}
          tickMargin={4}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--accent-bg)' }}
          content={<TooltipPeriodo agrupar={agrupar} />}
        />
        <Bar
          dataKey="ingresos"
          fill="var(--color-primary)"
          radius={[6, 6, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

const ALTURAS = [45, 62, 38, 78, 55, 88, 40, 70, 52, 82, 60, 48];

function ChartSkeleton() {
  return (
    <div className="flex h-72 items-end gap-2 px-2">
      {ALTURAS.map((altura) => (
        <Skeleton key={altura} className="flex-1 rounded-t-md" style={{ height: `${altura}%` }} />
      ))}
    </div>
  );
}