import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useReducedMotion } from 'framer-motion';
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
import { formatCop, mensajeError } from '@/shared/utils/format';
import type { IngresoMes } from '../types/reports.types';
import { formatEjeCompact, formatMes } from '../utils/report.format';
import { ErrorState } from './ErrorState';

const CHART_CONFIG = {
  total: { label: 'Ingresos', color: 'var(--chart-2)' },
} satisfies ChartConfig;

interface IngresosAreaChartProps {
  data?: IngresoMes[];
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
}

export function IngresosAreaChart({
  data,
  isLoading,
  error,
  onRetry,
}: IngresosAreaChartProps) {
  const reduceMotion = useReducedMotion();
  const mesActual = data?.at(-1)?.mes;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Ingresos</CardTitle>
        <CardDescription>Últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex min-h-[220px] flex-1 items-center justify-center">
            <Skeleton className="h-[220px] w-full" />
          </div>
        ) : error || !data ? (
          <ErrorState
            message={mensajeError(error, 'No se pudo cargar la tendencia.')}
            onRetry={onRetry}
          />
        ) : data.length === 0 ? (
          <div className="flex min-h-[200px] flex-1 items-center justify-center text-center">
            <div>
              <p className="text-sm font-medium">Sin ingresos registrados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este período aún no tiene pagos completados.
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={CHART_CONFIG}
            className="h-full min-h-[220px] w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(mes) => formatMes(String(mes), mesActual)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={56}
                tickFormatter={(value) => formatEjeCompact(Number(value))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => formatCop(Number(value))}
                    labelFormatter={(label) => {
                      const mes = formatMes(String(label), mesActual);
                      return mesActual && label === mesActual
                        ? `${mes} · Mes en curso`
                        : mes;
                    }}
                  />
                }
              />
              <Area
                dataKey="total"
                type="linear"
                fill="var(--color-total)"
                fillOpacity={0.4}
                stroke="var(--color-total)"
                dot={{
                  r: 4,
                  fill: 'var(--color-total)',
                  fillOpacity: 1,
                  stroke: 'var(--color-background)',
                  strokeWidth: 1.5,
                }}
                animationDuration={400}
                isAnimationActive={!reduceMotion}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}