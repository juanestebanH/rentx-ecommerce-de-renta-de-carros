import { useMemo, useState } from 'react';
import {
  useIngresosCategoria,
  useIngresosPeriodo,
  useRankingVehiculos,
  useResumenPeriodo,
} from '@/features/reports/hooks/useReports';
import { ExportReporteButton } from '@/features/reports/components/ExportReporteButton';
import { IngresosCategoriaBars } from '@/features/reports/components/IngresosCategoriaBars';
import { IngresosPeriodoChart } from '@/features/reports/components/IngresosPeriodoChart';
import { PeriodoSelector } from '@/features/reports/components/PeriodoSelector';
import { RankingVehiculosTable } from '@/features/reports/components/RankingVehiculosTable';
import { ReportesKpis } from '@/features/reports/components/ReportesKpis';
import {
  agruparPorPeriodo,
  diasDePeriodo,
  esPeriodoValido,
  periodoEsteMes,
  type Periodo,
} from '@/features/reports/utils/reporte.format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { formatRango } from '@/shared/utils/format';

function AdminReportsPage() {
  const [periodo, setPeriodo] = useState<Periodo>(() => periodoEsteMes());

  const valido = esPeriodoValido(periodo);
  const consulta = useMemo(
    () => ({
      desde: valido ? periodo.desde : '',
      hasta: valido ? periodo.hasta : '',
    }),
    [valido, periodo],
  );

  const agrupar = agruparPorPeriodo(
    diasDePeriodo(periodo.desde, periodo.hasta) || 1,
  );

  const resumen = useResumenPeriodo(consulta.desde, consulta.hasta);
  const ingresos = useIngresosPeriodo(consulta.desde, consulta.hasta, agrupar);
  const ranking = useRankingVehiculos(consulta.desde, consulta.hasta);
  const categorias = useIngresosCategoria(consulta.desde, consulta.hasta);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="space-y-1">
        <h1 className="my-0 text-3xl font-semibold tracking-tight">Reportes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analiza los ingresos, las rentas y la ocupación de un periodo.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodoSelector periodo={periodo} onChange={setPeriodo} />
        <ExportReporteButton
          key={`${periodo.desde}-${periodo.hasta}`}
          periodo={periodo}
          datos={{
            resumen: resumen.data,
            ingresos: ingresos.data,
            ranking: ranking.data,
            categorias: categorias.data,
          }}
        />
      </div>

      {!valido && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          El periodo seleccionado supera los 366 días permitidos. Elige un rango
          más corto.
        </p>
      )}

      {valido && (
        <>
          <ReportesKpis
            data={resumen.data}
            isLoading={resumen.isLoading}
            error={resumen.error}
            onRetry={() => void resumen.refetch()}
          />

          <Card>
            <CardHeader>
              <CardTitle>Ingresos en el tiempo</CardTitle>
              <CardDescription>
                {formatRango(periodo.desde, periodo.hasta)} ·{' '}
                {agrupar === 'semana' ? 'agrupado por semana' : 'agrupado por mes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IngresosPeriodoChart
                puntos={ingresos.data?.puntos ?? []}
                agrupar={agrupar}
                isLoading={ingresos.isLoading}
                error={ingresos.error}
                onRetry={() => void ingresos.refetch()}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-12">
            <Card className="min-w-0 xl:col-span-8">
              <CardHeader>
                <CardTitle>Ranking de vehículos</CardTitle>
                <CardDescription>
                  Top {ranking.data?.items.length ?? 10} por ingresos del periodo.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0">
                <RankingVehiculosTable
                  reporte={ranking.data}
                  totalIngresosPeriodo={resumen.data?.ingresos.actual ?? 0}
                  isLoading={ranking.isLoading}
                  error={ranking.error}
                  onRetry={() => void ranking.refetch()}
                />
              </CardContent>
            </Card>

            <Card className="min-w-0 xl:col-span-4">
              <CardHeader>
                <CardTitle>Ingresos por categoría</CardTitle>
                <CardDescription>
                  Distribución de los {formatRango(periodo.desde, periodo.hasta)}.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0">
                <IngresosCategoriaBars
                  reporte={categorias.data}
                  isLoading={categorias.isLoading}
                  error={categorias.error}
                  onRetry={() => void categorias.refetch()}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminReportsPage;