import { Cell, Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart';
import { formatNumero, mensajeError } from '@/shared/utils/format';
import type {
  EstadoFlotaItem,
  EstadoFlotaReporte,
  FlotaEstado,
} from '../types/reports.types';
import { ErrorState } from './ErrorState';

const CHART_CONFIG = {
  estado: { label: 'Estado' },
  value: { label: 'Carros' },
} satisfies ChartConfig;

const FLOTA_BUCKETS: Record<FlotaEstado, { label: string; fill: string }> = {
  disponibles: { label: 'Disponibles', fill: 'var(--chart-1)' },
  rentados: { label: 'Rentados', fill: 'var(--chart-blue)' },
  mantenimiento: { label: 'Mantenimiento', fill: 'var(--chart-3)' },
};

interface FlotaSlice {
  estado: FlotaEstado;
  label: string;
  fill: string;
  value: number;
  porcentaje: number;
}

interface FlotaDonutProps {
  data?: EstadoFlotaReporte;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function FlotaDonut({ data, isLoading, error, onRetry }: FlotaDonutProps) {
  const slices = buildSlices(data?.items ?? []);
  const total = data?.total_carros ?? 0;
  const clasificada = slices.reduce((acc, slice) => acc + slice.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Estado de la flota</CardTitle>
        <CardDescription>Distribución actual de los carros</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <ErrorState
            message={mensajeError(error, 'No se pudo cargar la flota.')}
            onRetry={onRetry}
          />
        ) : total === 0 ? (
          <FlotaVacia />
        ) : (
          <FlotaBody slices={slices} total={total} clasificada={clasificada} />
        )}
      </CardContent>
    </Card>
  );
}

function buildSlices(items: EstadoFlotaItem[]): FlotaSlice[] {
  return items.map((item) => ({
    estado: item.estado,
    label: FLOTA_BUCKETS[item.estado].label,
    fill: FLOTA_BUCKETS[item.estado].fill,
    value: item.cantidad,
    porcentaje: item.porcentaje,
  }));
}

interface FlotaBodyProps {
  slices: FlotaSlice[];
  total: number;
  clasificada: number;
}

function FlotaBody({ slices, total, clasificada }: FlotaBodyProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, _name, item) => {
                    const slice = item.payload as FlotaSlice;
                    const cantidad = formatNumero(Number(value));
                    const unidad = Number(value) === 1 ? 'carro' : 'carros';
                    return `${slice.label} · ${cantidad} ${unidad} · ${Math.round(slice.porcentaje)}%`;
                  }}
                />
              }
            />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="85%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="transparent"
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.estado} fill={slice.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatNumero(total)}
          </span>
          <span className="text-xs text-muted-foreground">
            {total === 1 ? 'carro' : 'carros'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {slices.map((slice) => (
          <div
            key={slice.estado}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.fill }}
              />
              {slice.label}
            </span>
            <span className="flex items-center gap-3 text-muted-foreground tabular-nums">
              <span>{formatNumero(slice.value)}</span>
              <span className="w-12 text-right">{Math.round(slice.porcentaje)}%</span>
            </span>
          </div>
        ))}
      </div>

      {clasificada !== total ? (
        <p className="flex items-center justify-between gap-3 border-t border-border/60 pt-2 text-xs text-muted-foreground">
          <span>Flota clasificada</span>
          <span className="tabular-nums">
            {formatNumero(clasificada)} de {formatNumero(total)} carros
          </span>
        </p>
      ) : null}
    </div>
  );
}

function FlotaVacia() {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center">
      <p className="my-0 text-sm font-medium text-foreground">
        Sin carros registrados
      </p>
      <p className="my-0 text-xs text-muted-foreground">
        Aquí verás el estado de cada carro de la flota.
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-[220px] flex-col justify-center gap-3">
      <Skeleton className="mx-auto size-40 rounded-full" />
    </div>
  );
}